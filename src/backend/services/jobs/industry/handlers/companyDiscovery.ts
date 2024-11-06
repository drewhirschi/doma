import { CompletionModels, getStructuredCompletion } from "../../llmHelpers";
import { Job, SandboxedJob } from "bullmq";

import Exa from "exa-js";
import { IndustryQueueClient } from "@shared/queues/industry-queue";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { z } from "zod";

export async function companyDiscovery(job: SandboxedJob) {
  const modelCmpId = job.data.cmpId; // startUrl
  if (!modelCmpId) {
    throw new Error("Property 'cmpId' is required in data payload");
  }

  return await findSimilarCompanies(modelCmpId);
}

export async function findSimilarCompanies(modelCmpId: number) {
  const sb = fullAccessServiceClient();
  const cmpGet = await sb.from("company_profile").select().eq("id", modelCmpId).single();
  if (cmpGet.error) {
    throw cmpGet.error;
  } else if (!cmpGet.data.web_summary) {
    throw new Error("Model Company summary not found");
  }

  const cmp = cmpGet.data;

  const SearchQuerySchema = z.object({
    queries: z.array(z.string()),
  });

  const queriesRes = await getStructuredCompletion({
    model: CompletionModels.gpt4o,
    system: `List 3 search queries based on the summary of the company that will be provided.
        Use short descriptions of what the company does based on their products and services.
        If the business operates on a local scale, include the location in the query.
        Examples:
        - An hvac company in Scotsdale, Arizona
        - An electric company in Seattle, Washington
        - Cloud communications, Unified Communications as a Service (UCaaS) sector, and Contact Center as a Service (CCaaS) company
        `,
    user: cmp.web_summary!,
    schema: SearchQuerySchema,
  });

  if (!queriesRes) {
    throw new Error("Failed to get structured completion for search queries");
  }

  console.log(queriesRes?.queries);

  // return
  const exa = new Exa(process.env.EXA_API_KEY);

  const searchProms = queriesRes.queries
    // .slice(0, 1)
    .map(async (query) => {
      // const searchResults = await Promise.all([
      //     googleSearch(query + " companies", 1),
      //     // googleSearch(query, 11),
      //     // googleSearch(query, 21),

      // ])
      // const flatResults = searchResults.flatMap(res => res.items)
      //     .filter(item => !!item.link)
      //     .filter(item => !item.link.includes(".pdf"))

      // return flatResults

      return await exa.search("the home page of " + query, {
        type: "neural",
        useAutoprompt: true,
        numResults: 25,
        category: "company",
      });
    });

  const searchRes = (await Promise.all(searchProms)).flatMap((res) => res.results);

  const insert = await sb
    .from("company_profile")
    .upsert(
      searchRes.map((item) => ({ origin: item.url })),
      { ignoreDuplicates: true, onConflict: "origin" },
    )
    .select();

  if (insert.error) {
    console.error(insert.error);
    throw insert.error;
  }

  const industryQueue = new IndustryQueueClient();

  for (const item of insert.data) {
    if (item.origin) await industryQueue.scrapeCompanyWebsite(item.id);
  }
  await industryQueue.close();

  return "completed";
}
