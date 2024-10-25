import { CompletionModels, getEmbedding, getStructuredCompletion } from "../../llmHelpers.js";
import { Job, Queue, SandboxedJob } from "bullmq";

import { IndustryQueueClient } from "@shared/queues/industry-queue.js";
import { Redis } from "ioredis";
import { TransactionExtractionSchema } from "../../googlesearch.types.js";
import { companyIdSchema } from "@shared/queues/industry-queue.types.js";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { getPageContents } from "../../webHelpers.js";
import { googleSearch } from "../../googlesearch.js";
import { isNotNull } from "@shared/types/typeHelpers";
import { title } from "process";
import { z } from "zod";

export async function transactionDiscovery(
  job: SandboxedJob<z.infer<typeof companyIdSchema>>,
) {
  const sb = fullAccessServiceClient();

  const cmpGet = await sb
    .from("company_profile")
    .select()
    .eq("id", job.data.cmpId)
    .single();
  if (cmpGet.error) {
    throw cmpGet.error;
  } else if (!cmpGet.data.web_summary) {
    throw new Error("Model Company summary not found");
  }

  const SearchQuerySchema = z.object({
    queries: z.array(z.string()),
  });
  const queriesRes = await getStructuredCompletion({
    system:
      "List 3 few-word-descriptions of what the company does based on their products and services",
    user: cmpGet.data.web_summary,
    schema: SearchQuerySchema,
  });
  if (!queriesRes) {
    throw new Error("Failed to get structured completion for search queries");
  }
  console.log(queriesRes?.queries);

  const searchProms = queriesRes.queries.map(async (query) => {
    const searchQuery = query + " acquisition";
    const queryEmb = await getEmbedding(query);
    const searchResults = await Promise.all([
      googleSearch(searchQuery, 1),
      googleSearch(searchQuery, 11),
      // googleSearch(searchQuery, 21),
      // googleSearch(searchQuery, 31),
      // googleSearch(searchQuery, 41),
      // googleSearch(searchQuery, 91),
    ]);
    const items = searchResults
      .flatMap((res) => res.items)
      .filter((item) => item.link)
      .filter((item) => !item.link.includes(".pdf"));

    return items.map((item) => ({
      query,
      full_query: searchQuery,
      query_emb: JSON.stringify(queryEmb),
      url: item.link,
      title: item.title,
    }));
  });

  const insertItems = (await Promise.all(searchProms)).flat();

  const insertArticles = await sb
    .from("transaction_search_res")
    .upsert(insertItems, { onConflict: "url", ignoreDuplicates: true })
    .select();

  if (insertArticles.error) {
    console.error(insertArticles.error);
    const err = new Error(
      `Error inserting transaction search results for cmpId: ${job.data.cmpId}. Error was: ${insertArticles.error.message}`,
    );
    err.cause = insertArticles.error;
    throw err;
  }

  // console.log(insertArticles.data)

  const items = insertArticles.data;

  // console.log(items.map((item, index) => item))

  const scrapeProms = items.map(async (item) => {
    const pageText = await getPageContents(item.url);

    if (!pageText) {
      return null;
    }

    const transactionsDescription = await getStructuredCompletion({
      system: `Extract anything about M&A transactions mentioned in the article. There may not be specific transactions.
    Use the article text as context. 
    Extract:
     the buyer name,
     the seller name,
     anything else mentioned about the seller,
    the reasoning for the transaction, 
    others -> names of other companies involved and their role like advisor or pe_backer, 
    a date for when the article in the format YYYY/MM/DD,
    a date for the transaction in the format YYYY/MM/DD, 
    (make sure to use slaches for the dates),
    a short description in the format [buyerName] mergers with/acquires/invest in [sellerName].
    
    if the article isn't about M&A transactions, mark is_transaction_article as false`,
      user: pageText,
      schema: TransactionExtractionSchema,
    }).catch((e) => {
      console.log("Failed to parse ", item.url, e);
      return null;
    });

    if (!transactionsDescription) {
      return null;
    }
    if (!transactionsDescription.is_transaction_article) {
      console.log("Skipping non transaction article", item.url);
      return null;
    }

    const embProms = transactionsDescription.transactions.map(async (td) => {
      return await getEmbedding(td.description);
    });

    const embs = await Promise.all(embProms);

    return transactionsDescription.transactions.map((td, index) => {
      return {
        ...td,
        url: item.url,
        title: item.title,
        // snippet: item.snippet,
        emb: JSON.stringify(embs[index]),
      };
    });
  });

  const transactions = (await Promise.all(scrapeProms))
    .filter((res) => res != null)
    .flat()
    .filter(isNotNull);
  // transactions.map(transaction => console.log({...transaction, emb: undefined}))

  const insert = await sb
    .from("transaction_search_res")
    .insert(transactions)
    .select();

  if (insert.error) {
    console.log("Failed to insert", insert.error);
    throw insert.error;
  }

  const queue = new IndustryQueueClient();

  await queue.enqueueBulk(
    insert.data?.map((transaction) => ({
      name: "transaction_linking",
      data: {
        trans_news_id: transaction.id,
      },
    })) ?? [],
  );

  return "Done";
}
