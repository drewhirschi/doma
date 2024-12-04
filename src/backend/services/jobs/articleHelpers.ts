import axios from "axios";
import { load } from "cheerio";
import { z } from "zod";
import https from "https";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { CompletionModels, getCompletion, getEmbedding, getStructuredCompletion } from "@shared/llmHelpers";

// Axios instance with custom headers
const axiosInstance = axios.create({
  headers: {
    "User-Agent": "google-bot",
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

// Function to check if the article is relevant to the company and M&A related
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

    let system = `Assess whether a single article matches the criteria of being about an M&A (Merger and Acquisition) event related to the specified company.

Evaluate based on these criteria:
1. **M&A Topic**: The article's content (title and page text) should indicate it covers M&A activity, such as mergers, acquisitions, joint ventures, divestitures, or takeovers.
2. **Company Mention**: Ensure the specified company, '${companyName}', is mentioned prominently and in connection with the M&A event.
3. **Single Article Check**: Confirm the content represents a single article about the event (not a homepage, list, or collection of articles).

# Output
Return true if all criteria are met; otherwise, return false.

# Examples

**Input**:
1. **URL**: "https://example.com/company-announcement"
   - **Title**: "TechCorp announces acquisition of InnovateX"
   - **Company Name**: "TechCorp"
   - **Page Text**: "TechCorp recently announced its acquisition of InnovateX, marking a major expansion in its market."

2. **URL**: "https://example.com/business-news"
   - **Title**: "Daily Business News Roundup"
   - **Company Name**: "TechCorp"
   - **Page Text**: "The latest news from various industries, including acquisitions, mergers, and other updates."

**Output**:
1. **Result**: true

2. **Result**: false
   
   # Notes

- The company's name should be either prominently mentioned in the title or several times throughout the article text.
- The text should contain specific language related to mergers, acquisitions, deals, or other synonymous phrases.
- Ignore URLs pointing to non-specific collections or unrelated company news.`;

    const gptResponse = await getStructuredCompletion({
      schema: z.object({
        relevant: z.boolean(),
      }),
      system: system,
      user: `Title: ${articleTitle}\n\nMeta Description: ${metaDescription}\n\nContent: ${pageText}`,
    });

    return gptResponse?.relevant ?? false;
  } catch (error) {
    console.error("Error scraping article:", error);
    return false;
  }
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

// Function to extract transaction details from an article using GPT
export async function extractTransactionDetails(title: string, pageText: string) {
  const transaction = await getStructuredCompletion({
    system: `You will receive content from a news article related to M&A. Extract from the article, if found, the transaction details such as the transaction participants 
    (buyer, seller, backer, advisor, or other, as well as any context you can provide about their participation.), transaction amount, transaction date, and reason for the merger/acquisition.
    Also, make a brief summary of non-null values in the format "Company A acquired Company B for $X million on DATE, with backing from Company C for REASON." Only use provided information.`,
    user: `Title: ${title}\n\nContent: ${pageText}`,
    schema: transactionSchema,
  });

  return transaction;
}

// Schema for the company match response
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
    threshold: 0.9,
  });

  if (error) {
    console.error("Error finding similar transactions:", error.message);
    throw new Error(error.message);
  }

  if (!existingTransactions || existingTransactions.length === 0) {
    return null;
  }

  const matched = await checkSimilarTransactions(description, existingTransactions);

  return matched;
}

// Transaction match schema
const transactionMatchSchema = z.object({
  id: z.number().nullable(),
});

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

  const gptResponse = await getStructuredCompletion({
    system: `You will be provided with a new M&A transaction description and a list of existing transactions.
    Your job is to determine if the new transaction is referencing an existing transaction.
    Respond with the id of the existing transaction that matches the new transaction, or return null if none match.`,
    user: xmlPayload,
    schema: transactionMatchSchema,
  });

  return existingTransactions.find((x) => x.id == gptResponse?.id) ?? null;
}

// Function to resolve the participant's company ID
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

    const cmp = await determineParticipant(companies, participant.name);

    return cmp?.id || null;
  } catch (error) {
    console.error("Error in resolveParticipantCmpId:", error);
    return null;
  }
}

// Function to determine if a participant matches a company in the database
async function determineParticipant<T extends { id: number }>(
  options: T[],
  lookingFor: string,
): Promise<{ id: number | null }> {
  try {
    const system = `
      You will be provided with a participant name that we are looking for, and a list of companies from our database that may match the participant.
      Your job is to determine if the participant matches any of the companies in the list. You should be confident that the participant is a match before providing an ID.
      The name of the participant should be nearly the same as the company name or an acronym of the company name. There will sometimes be clear matches, and other times there will be
      matches that are less certain, but still likely, so use your best judgment. If you are confident you have a match, return the company ID, and nothing but the ID.
      If you are not confident, return null, and nothing but null.`;

    const res = await getCompletion({
      model: CompletionModels.gpt4turbo,
      system,
      user: `# Participant Name:\n${lookingFor}\n\n# Options:\n${JSON.stringify(options)}`,
    });

    const cmpId = Number(res) || null;
    return { id: cmpId };
  } catch (error) {
    console.error("Error in determineParticipant:", error);
    return { id: null };
  }
}
