import axios from "axios";
import { getCompletion, getEmbedding, getStructuredCompletion } from "./llmHelpers.js";
import { load } from "cheerio";
import { z } from "zod";
import https from "https";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";

const axiosInstance = axios.create({
  headers: {
    "User-Agent": "google-bot",
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

// TODO 1: Fix relevancy filter to reject non single article links

// function to check if the article is relevant
export async function isArticleRelevant(
  articleUrl: string | null,
  articleTitle: string | null,
  companyName: string | null,
  pageText: string | null,
) {
  try {
    const { data } = await axiosInstance.get(articleUrl || "");
    const $ = load(data);
    const metaDescription = $('meta[name="description"]').attr("content");

    if (!pageText || pageText.length < 200 || metaDescription?.includes("homepage")) {
      return false;
    }

    const gptResponse = await getStructuredCompletion({
      schema: z.object({
        relevant: z.boolean(),
      }),
      system: `You will receive content from a webpage. If the page is a company blog or news homepage, it is not relevant. Only return true if it's a company-specific M&A news article.
      If the page is both about the company - '${companyName}' - and about an acquisition or merger involving this company, it is relevant.`,
      user: `Title: ${articleTitle}\n\nMeta Description: ${metaDescription}\n\nContent: ${pageText}`,
    });

    return gptResponse?.relevant ?? false;
  } catch (error) {
    console.error("Error scraping article:", error);
    return false;
  }
}

// Function to create a summary of an article using GPT
export async function summarizeArticle(title: string, pageText: string) {
  const gptResponse = await getCompletion({
    system: `You will be provided with content from an article. Summarize the article in 2-3 sentences in a concise and clear manner.`,
    user: `Title: ${title}\n\nContent: ${pageText}`,
  });

  return gptResponse;
}

// Transaction schema
const transactionSchema = z.object({
  participants: z.array(
    z.object({
      name: z.string(),
      role: z.enum(["buyer", "seller", "backer", "advisor", "other"]),
      context: z.string(),
    }),
  ),
  amount: z.string(),
  date: z.string().nullable(),
  reason: z.string(),
  description: z.string(),
});

// TODO 2: Improve transaction extraction prompt to get correct participants if they are there; make date consistent

// Function to extract transaction details from an article using GPT
export async function extractTransactionDetails(title: string, pageText: string) {
  const transaction = await getStructuredCompletion({
    system: `You will receive content from a news article related to M&A. Extract from the article, if found, the transaction details such as the participants 
    (buyer, seller, backer, advisor, or other, as well as any context you can provide about their participation.), transaction amount, date, and reason for the merger/acquisition.
    Also, make a brief summary of non-null values in the format "Company A acquired Company B for $X million on DATE, with backing from Company C for REASON." Only use provided information.`,
    user: `Title: ${title}\n\nContent: ${pageText}`,
    schema: transactionSchema,
  });

  return transaction;
}

export type SimialarTransaction = {
  id: number;
  description: string;
  similarity: number;
  emb: string;
};

// RPC function to compare new transaction with existing transactions
export async function findExistingTransaction(
  newEmbedding: number[],
  description: string,
): Promise<SimialarTransaction | null> {
  const sb = fullAccessServiceClient();

  const { data: existingTransactions, error } = await sb.rpc("match_transaction_embeddings", {
    new_embedding: JSON.stringify(newEmbedding),
    threshold: 0.95,
  });

  if (error) {
    console.error("Error finding similar transactions:", error.message);
    throw new Error(error.message);
  }

  if (!existingTransactions || existingTransactions.length === 0) {
    return null;
  }

  // Call checkSimilarTransactions with the new transaction description and existing transactions
  const matched = await checkSimilarTransactions(description, existingTransactions);

  return matched;
}

// The schema for the transaction match response
const transactionMatchSchema = z.object({
  id: z.number().nullable(),
});

// TODO 3: Improve transaction matching prompt to make it more clear

// Function to use GPT to check if the new transaction is the same as any existing transactions based on similarity and description
export async function checkSimilarTransactions(
  newTransaction: string,
  existingTransactions: SimialarTransaction[],
): Promise<SimialarTransaction | null> {
  const transactionListXml = existingTransactions
    .map(
      ({ id, description }) => `
      <transaction id="${id}">
        <description>${description}</description>
      </transaction>`,
    )
    .join("");

  const xmlPayload = `
    <transactionCheck>
      <newTransaction>
        <description>${newTransaction}</description>
      </newTransaction>
      <existingTransactions>
        ${transactionListXml}
      </existingTransactions>
    </transactionCheck>
  `;

  // Use GPT structured completion to check for matching transaction
  const gptResponse = await getStructuredCompletion({
    system: `You will be provided with a new M&A transaction description and a list of existing transactions.
    Your job is to determine if the new transaction is referencing an existing transaction.
    Respond with the id of the existing transaction that matches the new transaction, or return null if none match.`,
    user: xmlPayload,
    schema: transactionMatchSchema,
  });

  return existingTransactions.find((x) => x.id == gptResponse?.id) ?? null;
}

// Function using gpt to determine what role a company played in a transaction based on company name and transaction description
export async function determineCompanyRole(companyName: string, transactionDescription: string) {
  const gptResponse = await getCompletion({
    system: `You will be provided with the name of a company and a description of a transaction. Determine the role of the company in the transaction. Respond with either "buyer", "seller", or "backer". Only the word and nothing else.`,
    user: `Company Name: ${companyName}\n\nTransaction Description: ${transactionDescription}`,
  });

  return gptResponse;
}

// TODO 4: Work on participant resolution so it better matches companies
// TODO 5: Fix timeout issue with the rpc

export async function resolveParticipantCmpId(participant: { name: string; role: string; context: string }) {
  try {
    const sb = fullAccessServiceClient();
    const participantDescription = `## ${participant.name}\n### Role: ${participant.role}\n${participant.context}`;
    const emb = await getEmbedding(participantDescription);

    const quickResolve = await sb
      .from("company_profile")
      .select("id, name")
      .ilike("name", `%${participant.name}%`)
      .limit(1);

    // If you get a simple match, use it, else proceed with the RPC
    if (quickResolve.data?.length) {
      return quickResolve.data[0].id;
    }

    const companiesGet = await sb.rpc("match_cmp_adaptive", {
      match_count: 10,
      query_embedding: emb as unknown as string,
    });

    if (companiesGet.error) {
      throw companiesGet.error;
    }

    const companies = companiesGet.data.map((cmp) => ({
      id: cmp.id,
      name: cmp.name,
      summary: cmp.description ?? cmp.web_summary,
    }));

    const cmp = await determineParticipant(companies, participantDescription);

    if (!cmp) {
      console.log("No confident match found for participant:", participant.name);
    }

    return cmp?.id || null;
  } catch (error) {
    console.error("Error in resolveParticipantCmpId:", error);
    return null;
  }
}

async function determineParticipant<T extends { id: number }>(options: T[], lookingFor: string): Promise<T | null> {
  try {
    const system = `
      You are determining if a participant from a news article matches any company in our database. 
      You are given a description of the participant and possible company options from our database. 
      Only return the id if you are confident it is the correct company, based on clear matching details.

      If none of the options represent the same company with high certainty, return null instead.
      Do not guess or provide a match unless you are certain.
    `;

    const res = await getStructuredCompletion({
      schema: z.object({
        id: z.number().nullable(),
        confidence: z.enum(["low", "medium", "high"]).nullable(),
      }),
      system,
      user: `# Participant Description:\n${lookingFor}\n\n# Options:\n${JSON.stringify(options)}`,
    });

    // Only accept high-confidence matches; otherwise, return null
    if (!res || res.confidence !== "high" || !res.id) {
      console.log("Low or medium confidence, or no match:", res);
      return null;
    }

    return options.find((option) => option.id === res.id) || null;
  } catch (error) {
    console.error("Error in determineParticipant:", error);
    return null;
  }
}
