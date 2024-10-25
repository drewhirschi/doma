require("dotenv").config({ path: "./.env.local" });
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { isNotNull } from "@shared/types/typeHelpers";
import Exa from "exa-js";
import {
  compareTransactions,
  determineCompanyRole,
  extractTransactionDetails,
  isArticleRelevant,
  summarizeArticle,
} from "~/services/jobs/articleHelpers";
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
  const searchAndContentResults = await exa.searchAndContents(
    `${company.name} acquisition`,
    {
      type: "keyword",
      useAutoprompt: true,
      numResults: 5,
      category: "news",
      startPublishedDate: "2018-01-01",
      text: true,
    },
  );

  if (
    !searchAndContentResults ||
    !searchAndContentResults.results ||
    searchAndContentResults.results.length === 0
  ) {
    const noArticlesMessage = "No articles found for the company.";
    console.log(noArticlesMessage);
    return noArticlesMessage;
  }

  console.log("Search Results:", searchAndContentResults.results);

  // TODO: Insert into database now and get back only new articles

  // TODO: Remove mapping of content to article URL and just use result object

  // Get article contents once and store them
  const articleContentsMap = new Map<string, string | null>();

  // First, get all article contents
  await Promise.all(
    searchAndContentResults.results.map(async (result) => {
      const pageText = result.text;
      articleContentsMap.set(result.url, pageText);
    }),
  );

  // Filter the articles based on GPT qualification
  const qualifiedArticles = (
    await Promise.all(
      searchAndContentResults.results.map(async (result) => {
        const pageText = articleContentsMap.get(result.url);
        const isRelevant = await isArticleRelevant(
          result.url,
          result.title,
          company.name,
          pageText ?? null,
        );
        return isRelevant ? result : null;
      }),
    )
  ).filter(isNotNull);

  console.log("Filtered Articles:", qualifiedArticles);

  // First, insert qualified articles without summaries into the database
  const insertResult = await sb
    .from("ma_articles")
    .insert(
      qualifiedArticles.map((article) => ({
        url: article?.url || "",
        publish_date: article?.publishedDate,
        title: article?.title,
        text: articleContentsMap.get(article?.url || ""),
        author: article?.author,
      })),
    )
    .select("url");

  if (insertResult.error) {
    console.error("Error inserting articles:", insertResult.error.message);
  }

  // Summarize each article, then update it with the new summary
  await Promise.all(
    qualifiedArticles.map(async (article) => {
      const pageText = articleContentsMap.get(article?.url || "");
      const summary = await summarizeArticle(
        article?.title || "No Title",
        pageText || "No Content",
      );

      // Update article with the summary
      const updateResult = await sb
        .from("ma_articles")
        .update({ summary })
        .eq("url", article?.url || "");

      if (updateResult.error) {
        console.error(
          `Error updating article summary for URL ${article?.url || ""}:`,
          updateResult.error.message,
        );
      }
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

  // Compare the transaction embeddings to see if they match any existing transactions
  await Promise.all(
    transactionEmbeddings.map(async (transaction, idx) => {
      let isMatch;
      try {
        // Perform the comparison (if needed) to find matching transactions
        isMatch = await compareTransactions(
          transaction.embedding,
          transaction.description || "",
        );
      } catch (error) {
        console.error(
          `Error comparing transaction embeddings: ${(error as Error).message}`,
        );
        return;
      }

      console.log(isMatch);

      if (isMatch && isMatch > -1) {
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
        let companyRole;
        try {
          companyRole = await determineCompanyRole(
            company.name || "",
            transaction.description || "",
          );
        } catch (error) {
          console.error(
            `Error determining company role: ${(error as Error).message}`,
          );
          return;
        }

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
          let companyRole;
          try {
            companyRole = await determineCompanyRole(
              company.name || "",
              transaction.description || "",
            );
          } catch (error) {
            console.error(
              `Error determining company role: ${(error as Error).message}`,
            );
            return;
          }

          const { error: partcpntError } = await sb.from("ma_partcpnt").insert({
            trans_id: insertedId,
            cmp_id: company.id,
            role: companyRole?.toString(),
          });

          if (partcpntError) {
            console.error(
              `Error linking transaction ${insertedId} with company:`,
              partcpntError.message,
            );
          }
        }
      }
    }),
  );

  // TODO: We need to check the database to see if we have the companies in the database and if not add them to the job queue to be added

  // TODO: Insert into the database the transaction linked to each remaining company

  console.log("End of Test");
  return;
}

main();
