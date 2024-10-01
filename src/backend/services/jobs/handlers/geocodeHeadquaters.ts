import { Job, SandboxedJob } from "bullmq";

import { Client } from "@googlemaps/google-maps-services-js";
import { IndustryQueueClient } from "../industry-queue.js";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { getStructuredCompletion } from "../llmHelpers.js";
import { z } from "zod";

export async function resolveLocations(job: SandboxedJob) {
  const modelCmpId = job.data.cmpId; // startUrl
  if (!modelCmpId) {
    throw new Error("Property 'cmpId' is required in data payload");
  }

  return await geocodeCompany(modelCmpId);
}

export async function geocodeCompany(modelCmpId: number) {
  const sb = fullAccessServiceClient();
  const cmpGet = await sb
    .from("company_profile")
    .select()
    .eq("id", modelCmpId)
    .single();
  if (cmpGet.error) {
    throw cmpGet.error;
  } else if (!cmpGet.data.web_summary) {
    throw new Error("Model Company summary not found");
  }

  const cmp = cmpGet.data;

  const queriesRes = await getStructuredCompletion({
    // model: "gpt-4o-2024-08-06",
    system: `Extract addresses or general locations that we can use to geocode the company.
        `,
    user: cmp.web_summary!,
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
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });

  if (!geocodeRes.data) {
    throw new Error("Failed to geocode headquaters");
  }

  const { location } = geocodeRes.data.results[0].geometry;

  const update = await sb
    .from("company_profile")
    .update({
      headquaters: geoPointString(location.lng, location.lat),
    })
    .eq("id", modelCmpId);

  return "completed";
}
export function geoPointString(lon: number, lat: number) {
  return `POINT(${lon} ${lat})`;
}
