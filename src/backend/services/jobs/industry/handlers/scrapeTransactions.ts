import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import Exa from "exa-js";
import {
  findExistingTransaction,
  extractTransactionDetails,
  isArticleRelevant,
  SimialarTransaction,
  resolveParticipantCmpId,
} from "~/services/jobs/articleHelpers";
import { getEmbedding } from "~/services/jobs/llmHelpers";
import { SandboxedJob } from "bullmq";
import { IndustryQueueClient } from "@shared/queues/industry-queue";
import { exaRes } from "~/scripts/data";

export default async function handler(job: SandboxedJob) {
  return await scrapeArticles(job.data.cmpId);
}
export async function scrapeArticles(cmpId: number) {
  const sb = fullAccessServiceClient();

  // get the company
  const cmpGet = await sb.from("company_profile").select().eq("id", cmpId).single();
  if (cmpGet.error) {
    throw cmpGet.error;
  }

  // set up the company
  const company = cmpGet.data;

  console.log("Finding Articles For: ", company.name);

  // set up the exa api
  const exa = new Exa(process.env.EXA_API_KEY);

  // search for company related acquisition articles from exa
  //   const searchAndContentResults = await exa.searchAndContents(`${company.name} acquisition`, {
  //     type: "keyword",
  //     useAutoprompt: true,
  //     numResults: 5,
  //     category: "news",
  //     startPublishedDate: "2018-01-01",
  //     text: true,
  //   });

  //   if (!searchAndContentResults || !searchAndContentResults.results || searchAndContentResults.results.length === 0) {
  //     const noArticlesMessage = "No articles found for the company.";
  //     console.log(noArticlesMessage);
  //     return noArticlesMessage;
  //   }

  // Use for testing
  const searchAndContentResults = {
    results: exaRes,
  };

  // First, insert qualified articles without summaries into the database
  const insertResult = await sb
    .from("ma_articles")
    .upsert(
      searchAndContentResults.results.map((article) => ({
        url: article.url || "",
        publish_date: article.publishedDate,
        title: article.title,
        text: article.text,
        author: article?.author,
      })),
      { ignoreDuplicates: true },
    )
    .select();

  if (insertResult.error) {
    console.error("Error inserting articles:", insertResult.error.message);
    throw insertResult.error;
  }

  const articles = insertResult.data;

  console.log("Articles:", articles);

  // Filter the articles based on GPT qualification
  const qualifiedResults = await Promise.all(
    articles.map(async (article) => {
      const isRelevant = await isArticleRelevant(article.url, article.title, company.name, article.text);
      return isRelevant ?? false;
    }),
  );

  const qualifiedArticles = articles.filter((_article, index) => qualifiedResults[index]);

  console.log("Qualified Articles:", qualifiedArticles);

  // use gpt to extract from the articles the buyer, seller, backer, amount, date, and reason and create a transaction description
  const articleTransactionDetails = await Promise.all(
    qualifiedArticles.map(async (article) => {
      const transaction = await extractTransactionDetails(article?.title || "No title", article.text || "No content");
      const embedding = await getEmbedding(transaction?.description || "");

      return {
        transaction,
        embedding,
        ...article,
      };
    }),
  );

  // Compare the transaction embeddings to see if they match any existing transactions
  for (const article of articleTransactionDetails) {
    let existingTransaction: SimialarTransaction | null = null;
    try {
      // Perform the comparison (if needed) to find matching transactions
      existingTransaction = await findExistingTransaction(article.embedding, article.transaction?.description || "");
    } catch (error) {
      console.error(`Error comparing transaction embeddings: ${(error as Error).message}`);
      continue;
    }

    if (existingTransaction) {
      const { error: supportError } = await sb.from("ma_trans_support").insert({
        trans_id: existingTransaction.id,
        article_id: article.url,
      });

      if (supportError) {
        console.error(`Error linking transaction ${existingTransaction} with article:`, supportError.message);
      }
    } else {
      // Insert the new transaction into the "ma_transaction" table
      const transactionInsert = await sb
        .from("ma_transaction")
        .insert({
          reason: article.transaction?.reason,
          emb: JSON.stringify(article.embedding),
          description: article.transaction?.description,
          amount: Number(article.transaction?.amount),
          date: article.transaction?.date,
        })
        .select("id")
        .single();

      if (transactionInsert.error) {
        console.error(`Error inserting transaction for article ${article.url}:`, transactionInsert.error.message);
        continue;
      }

      // Now associate the new transaction with the article in "ma_trans_support"
      const { error: supportError } = await sb.from("ma_trans_support").insert({
        trans_id: transactionInsert.data.id,
        article_id: article.url,
      });

      if (supportError) {
        console.error(`Error linking transaction ${transactionInsert.data.id} with article:`, supportError.message);
      }

      // TODO: Work on participant resolution

      const insertPartcpntProms = article.transaction?.participants.map(async (participant) => {
        let resolvedCmpId = await resolveParticipantCmpId(participant);

        if (!resolvedCmpId) {
          //   const cmpInsert = await sb.from("company_profile").insert({}).select().single();
          //   if (cmpInsert.error) {
          //     console.error(`Error inserting transaction for article ${article.url}:`, cmpInsert.error.message);
          //     return;
          //   }
          //   resolvedCmpId = cmpInsert.data.id;
          //   const industryQueue = new IndustryQueueClient();
          //   industryQueue.findCompany(cmpInsert.data.id, participant);
          //   await industryQueue.close();
          console.log("Participant not found in database:", participant);
        } else {
          const particntToInsert = {
            trans_id: transactionInsert.data.id,
            cmp_id: resolvedCmpId,
            role: participant.role,
          };

          const { error: partcpntError } = await sb.from("ma_partcpnt").insert(particntToInsert);

          if (partcpntError) {
            console.error(`Error linking transaction ${existingTransaction} with company:`, partcpntError.message);
          }
        }
      });
    }
  }

  console.log("End of Scraping");
}
