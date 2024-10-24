import {
  CompletionModels,
  getCompletion,
  getEmbedding,
  getStructuredCompletion,
  recursiveDocumentReduction,
} from "../../llmHelpers.js";

import { Client } from "@googlemaps/google-maps-services-js";
import { LinkedInQueueClient } from "@shared/queues/linkedin-queue.js";
import { IndustryQueueClient } from "@shared/queues/industry-queue.js";
import { SandboxedJob } from "bullmq";
import { companyInfoCombination } from "../../prompts.js";
import { fullAccessServiceClient } from "@shared/supabase-client/server";
import { isNotNull } from "@shared/types/typeHelpers.js";
import { z } from "zod";

export async function reduceCompanyPagesToProfile(job: SandboxedJob) {
  const supabase = fullAccessServiceClient();
  const { cmpId } = job.data;

  const companyGet = await supabase
    .from("company_profile")
    .select("*, comp_pages(*)")
    .eq("id", cmpId)
    .single();

  if (companyGet.error) {
    throw companyGet.error;
  }

  if (companyGet.data.web_summary) {
    console.log("web summary already exists", cmpId);
    return;
  }

  const indexedPages = companyGet.data.comp_pages;

  const companySummary = await recursiveDocumentReduction({
    documents: indexedPages.map((ip) => ip.cmp_info).filter(isNotNull),
    instruction: companyInfoCombination,
  });
  const summaryEmb = await getEmbedding(companySummary);

  const businessModel = await getCompletion({
    system: "extract what products and services the company offers",
    user: companySummary,
  });

  if (businessModel == null) {
    throw new Error("failed to get business products and services");
  }

  const bmEmb = await getEmbedding(businessModel);

  const emb = weightedAverage(summaryEmb, bmEmb, 1, 9);

  const summaryUpdate = await supabase
    .from("company_profile")
    .update({
      web_summary: companySummary,
      web_summary_emb: JSON.stringify(emb),
    })
    .eq("id", cmpId);
  if (summaryUpdate.error) {
    throw summaryUpdate.error;
  }

  const [cmpName, cmpDescription, cmpLocation] = await Promise.all([
    extractCompanyName(companySummary),
    generateCompanyDescription(companySummary),
    geocodeCompany(companySummary),
  ]);

  const cmpUpdate = await supabase
    .from("company_profile")
    .update({
      name: cmpName ?? undefined,
      description: cmpDescription,
      hq_geo: cmpLocation.hq_geo,
      hq_lon: cmpLocation.hq_lon,
      hq_lat: cmpLocation.hq_lat,
    })
    .eq("id", cmpId);
  if (cmpUpdate.error) {
    throw cmpUpdate.error;
  }

  //TODO: parse summary into structured data

  const linkedinQueue = new LinkedInQueueClient();
  await linkedinQueue.getCompanyLinkedInProfile(companyGet.data.id);
  await linkedinQueue.close();

  const industryQueue = new IndustryQueueClient();
  await industryQueue.scrapeArticles(companyGet.data.id);
  await industryQueue.close();
}

export function weightedAverage(
  vectorA: number[],
  vectorB: number[],
  weightA: number,
  weightB: number,
): number[] {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length");
  }

  const weightedSum: number[] = vectorA.map(
    (a, i) => a * weightA + vectorB[i] * weightB,
  );
  const totalWeight = weightA + weightB;

  return weightedSum.map((value) => value / totalWeight);
}

export async function generateCompanyDescription(cmpSummary: string) {
  try {
    const description = await getCompletion({
      system: `Generate a concise one-sentence description of a company by identifying who they are and what they do(from the summary provided), without mentioning their location or size.
# Output Format
- A single sentence summarizing the company's identity and function.`,
      user: cmpSummary,
    });
    return description;
  } catch (error) {
    return null;
  }
}

export async function extractCompanyName(cmpSummary: string) {
  try {
    const name = await getCompletion({
      system: `Extract the name of a company from the provided summary.
            The model should read the summary and identify the name of the company it describes.
            # Output Format
            - A single line containing only the company name. No additional text, explanations, or formatting.`,
      user: cmpSummary,
    });
    return name;
  } catch (error) {
    return null;
  }
}

export async function geocodeCompany(cmpSummary: string) {
  const queriesRes = await getStructuredCompletion({
    model: CompletionModels.gpt4o,
    system: `Extract addresses or general locations that we can use to geocode the company.
        `,
    user: cmpSummary,
    schema: z.object({
      headquaters: z.string(),
      locations: z.array(z.string()),
    }),
  });

  if (!queriesRes) {
    throw new Error(
      "Failed to get structured completion for location addresses",
    );
  }

  const googleMaps = new Client({});
  const geocodeRes = await googleMaps.geocode({
    params: {
      address: queriesRes.headquaters,
      key: process.env.GEOCODE_API_KEY!,
    },
  });

  if (!geocodeRes.data) {
    throw new Error("Failed to geocode headquaters");
  }

  const { location } = geocodeRes.data.results[0].geometry;

  return {
    hq_geo: geoPointString(location.lng, location.lat),
    hq_lon: location.lng,
    hq_lat: location.lat,
  };
}
export function geoPointString(lon: number, lat: number) {
  return `POINT(${lon} ${lat})`;
}
