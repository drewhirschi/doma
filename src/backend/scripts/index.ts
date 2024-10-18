require("dotenv").config({ path: "./.env.local" });
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import Exa, { SearchResult } from "exa-js";
import axios from "axios";
import https from "https";
import { load } from "cheerio";
import {
  getArticleContents,
  summarizeArticle,
} from "~/services/jobs/webHelpers";
import { getCompletion, getEmbedding } from "~/services/jobs/llmHelpers";

// set up axios to scrape the articles
const axiosInstance = axios.create({
  headers: {
    "User-Agent": "google-bot",
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

// function to check if the article is relevant
async function isArticleRelevant(
  article: SearchResult<{}>,
  companyName: string | null,
) {
  try {
    const { data } = await axiosInstance.get(article?.url || "");
    const $ = load(data);
    const metaDescription = $('meta[name="description"]').attr("content");
    const pageText = await getArticleContents(article.url);

    if (!pageText) {
      return false;
    }

    const gptResponse = await getCompletion({
      system: `You will be provided with content scraped from an article. 
      Your job is to decide if the article is both about the company - '${companyName}' - and about an acquisition involving this company.
       Respond simply with true or false.`,
      user: `Title: ${article.title}\n\nMeta Description: ${metaDescription}\n\nContent: ${pageText}`,
    });

    return gptResponse?.toLowerCase().includes("true");
  } catch (error) {
    console.error("Error scraping article:", error);
    return false;
  }
}

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
  console.log("Company Name: ", company.name);

  // set up the exa api
  const exa = new Exa(process.env.EXA_API_KEY);

  // search for company related acquisition articles from exa
  const searchResults = await exa.search(`${company.name} acquisition`, {
    type: "keyword",
    useAutoprompt: true,
    numResults: 5,
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

  // Filter the articles based on GPT qualification
  const filteredArticles = await Promise.all(
    searchResults.results.map(async (result) => {
      const isRelevant = await isArticleRelevant(result, company.name);
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
      const pageText = await getArticleContents(article?.url || "");
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

  // insert the qualified articles into the database - ma_articles

  // use gpt to extract from the articles the buyer, seller, backer, amount, date, and reason and create a transaction
  const transactions = await Promise.all(
    qualifiedArticles.map(async (article) => {
      const pageText = await getArticleContents(article?.url || "");
      const transaction = await getCompletion({
        system: `Extract, if found, the buyer, seller, backer, amount, date, and acquisition reason from the article and create a transaction report.`,
        user: `Title: ${article?.title}\n\nContent: ${pageText}`,
      });

      return {
        transaction,
      };
    }),
  );

  console.log("Transactions:", transactions);

  // use gpt to create a description  of the transaction (company x buys company y on date for amount)
  const transactionDescriptions = await Promise.all(
    transactions.map(async (transaction) => {
      const description = await getCompletion({
        system: `Generate a concise one-sentence description of the transaction, leaving out the values that aren't present.
         Use the format 'Company X buys Company Y on Date for Amount'.`,
        user: "Transaction: " + transaction.transaction,
      });

      return {
        description,
      };
    }),
  );

  console.log("Transaction Descriptions:", transactionDescriptions);

  // check to see if the buyer and seller are companies in the database

  // if not, create them and add to the database, add to the queue to process later - company_profile

  // generate an embedding for the transaction description
  const transactionEmbeddings = await Promise.all(
    transactionDescriptions.map(async (transaction) => {
      const embedding = await getEmbedding(transaction?.description || "");
      return embedding;
    }),
  );

  console.log("Transaction Embeddings:", transactionEmbeddings);

  // compare the embedding with other transactions in the database to see if it is the same as a transaction already in the database (> 0.9)
  const allExistingEmbeddings = await sb
    .from("ma_transaction")
    .select("id, emb");

  const processedTransactions = await Promise.all(
    transactionEmbeddings.map(async (newEmbedding, idx) => {
      let isMatch = false;
      let matchingTransactionId = null;

      if (allExistingEmbeddings.error) {
        throw allExistingEmbeddings.error;
      }

      // Loop through all existing embeddings to compare similarity
      for (const existingTransaction of allExistingEmbeddings.data) {
        const existingEmbedding = existingTransaction.emb;
        //const similarity = computeSimilarity(newEmbedding, existingEmbedding);
        const similarity = 0.95;

        if (similarity > 0.9) {
          isMatch = true;
          matchingTransactionId = existingTransaction.id;
          break;
        }
      }

      if (isMatch) {
        // If match found, skip adding new transaction, but store the existing transaction ID
        console.log(
          `Transaction ${idx + 1} matches existing transaction with ID: ${matchingTransactionId}`,
        );

        return null; // Indicate no new transaction was added
      } else {
        // If no match, add the new transaction to the database
        console.log(`Added new transaction for Transaction ${idx + 1}`);

        return null;
      }
    }),
  );

  // Filter out null values from processedTransactions (i.e., those that were matched and skipped)
  const newTransactions = processedTransactions.filter(
    (tx: null) => tx !== null,
  );

  console.log("New Transactions Added:", newTransactions);

  // if it is the same, just mark the transaction id, don't add to the database, if not, add to the database and mark the new id - ma_transaction

  // insert into the database the transaction linked to each company and their role - ma_partcpnt

  // insert into the database the transaction linked to the article - ma_trans_support

  console.log("End of Test");
  return;
}

main();
