require("dotenv").config({ path: "./.env.local" });
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import Exa from "exa-js";
import {
  compareTransactions,
  determineCompanyRole,
  extractTransactionDetails,
  getArticleContents,
  isArticleRelevant,
  summarizeArticle,
} from "~/services/jobs/webHelpers";
import { getEmbedding } from "~/services/jobs/llmHelpers";

async function main() {
  console.log("Testing Company Acquisition Article Scraper");

  const sb = fullAccessServiceClient();

  // get the company
  const cmpGet = await sb
    .from("company_profile")
    .select()
    .eq("id", 66)
    .single();
  if (cmpGet.error) {
    throw cmpGet.error;
  }

  // set up the company
  const company = cmpGet.data;
  console.log("Finding Articles For: ", company.name);

  // set up the exa api
  const exa = new Exa(process.env.EXA_API_KEY);

  // search for company related acquisition articles from exa
  const searchResults = await exa.search(`${company.name} acquisition`, {
    type: "keyword",
    useAutoprompt: true,
    numResults: 30,
    category: "news",
    startPublishedDate: "2018-01-01",
  });

  if (
    !searchResults ||
    !searchResults.results ||
    searchResults.results.length === 0
  ) {
    console.log("No articles found for the company.");
    return;
  }

  console.log("Search Results:", searchResults.results);

  // Get article contents once and store them
  const articleContentsMap = new Map<string, string | null>();

  // First, get all article contents
  await Promise.all(
    searchResults.results.map(async (result) => {
      const pageText = await getArticleContents(result.url);
      articleContentsMap.set(result.url, pageText);
    }),
  );

  // Filter the articles based on GPT qualification
  const filteredArticles = await Promise.all(
    searchResults.results.map(async (result) => {
      const pageText = articleContentsMap.get(result.url);
      const isRelevant = await isArticleRelevant(
        result.url,
        result.title,
        company.name,
        pageText ?? null,
      );
      return isRelevant ? result : null;
    }),
  );

  // Remove null values from filteredArticles
  const qualifiedArticles = filteredArticles.filter(
    (article) => article !== null,
  );

  console.log("Filtered Articles:", qualifiedArticles);

  // use gpt to create summaries of the articles
  const summarizedArticles = await Promise.all(
    qualifiedArticles.map(async (article) => {
      const pageText = articleContentsMap.get(article?.url || "");
      const summary = await summarizeArticle(
        article?.title || "No Title",
        pageText || "No Content",
      );
      return {
        summary,
      };
    }),
  );

  console.log("Summarized Articles:", summarizedArticles);

  // insert the qualified articles into the database - ma_articles (url (primary key), publish_date, title, summary, text, author)
  await Promise.all(
    qualifiedArticles.map(async (article, idx) => {
      const summary = summarizedArticles[idx].summary;
      await sb.from("ma_articles").insert({
        url: article?.url || "",
        publish_date: article?.publishedDate,
        title: article?.title,
        summary: summary,
        text: articleContentsMap.get(article?.url || ""),
        author: article?.author,
      });
    }),
  );

  // use gpt to extract from the articles the buyer, seller, backer, amount, date, and reason and create a transaction description
  const transactions = await Promise.all(
    qualifiedArticles.map(async (article) => {
      const pageText = articleContentsMap.get(article?.url || "");
      const transaction = await extractTransactionDetails(
        article?.title || "",
        pageText || "",
      );
      return {
        ...transaction,
        pageText,
        article_id: article?.url || "",
      };
    }),
  );

  console.log("Transactions:", transactions);

  // generate an embedding for the transaction description
  const transactionEmbeddings = await Promise.all(
    transactions.map(async (transaction) => {
      const embedding = await getEmbedding(transaction?.description || "");
      return { ...transaction, embedding };
    }),
  );

  console.log("Transaction Embeddings:", transactionEmbeddings);

  // compare the transaction embeddings to see if they match any existing transactions
  await Promise.all(
    transactionEmbeddings.map(async (transaction, idx) => {
      // Perform the comparison (if needed) to find matching transactions
      const isMatch = await compareTransactions(
        transaction.embedding,
        transaction.description || "",
      );

      console.log(isMatch);

      if (isMatch && isMatch > 0) {
        // You could associate the new transaction with the existing one here if needed
        const { error: supportError } = await sb
          .from("ma_trans_support")
          .insert({
            trans_id: isMatch,
            article_id: transaction.article_id,
          });

        if (supportError) {
          console.error(
            `Error linking transaction ${isMatch} with article:`,
            supportError.message,
          );
        }

        // Finally, link the transaction with the company in "ma_partcpnt"
        const companyRole = await determineCompanyRole(
          company.name || "",
          transaction.description || "",
        );

        const { error: partcpntError } = await sb.from("ma_partcpnt").insert({
          trans_id: isMatch,
          cmp_id: company.id,
          role: companyRole?.toString(),
        });

        if (partcpntError) {
          console.error(
            `Error linking transaction ${isMatch} with company:`,
            partcpntError.message,
          );
        }
      } else {
        // Insert the new transaction into the "ma_transaction" table
        const { data, error } = await sb
          .from("ma_transaction")
          .insert({
            reason: transaction.reason,
            emb: JSON.stringify(transaction.embedding),
            description: transaction.description,
            amount: Number(transaction.amount),
            date: transaction.date,
          })
          .select("id");

        if (error) {
          console.error(
            `Error inserting transaction ${idx + 1}:`,
            error.message,
          );
        } else if (data && data.length > 0) {
          const insertedId = data[0].id;

          // Now associate the new transaction with the article in "ma_trans_support"
          const { error: supportError } = await sb
            .from("ma_trans_support")
            .insert({
              trans_id: insertedId,
              article_id: transaction.article_id,
            });

          if (supportError) {
            console.error(
              `Error linking transaction ${insertedId} with article:`,
              supportError.message,
            );
          }

          // Finally, link the transaction with the company in "ma_partcpnt"
          const companyRole = await determineCompanyRole(
            company.name || "",
            transaction.description || "",
          );

          const { error: partcpntError } = await sb.from("ma_partcpnt").insert({
            trans_id: data[0].id,
            cmp_id: company.id,
            role: companyRole?.toString(),
          });

          if (partcpntError) {
            console.error(
              `Error linking transaction ${data[0].id} with company:`,
              partcpntError.message,
            );
          }
        }
      }
    }),
  );

  // We need to check the database to see if we have the companies in the database and if not add them to the job queue to be added

  // insert into the database the transaction linked to each remaining company

  console.log("End of Test");
  return;
}

main();
