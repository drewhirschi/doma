require("dotenv").config({ path: "./.env.local" });

import { fullAccessServiceClient } from "@shared/supabase-client/server";
import { geocodeCompany } from "~/services/jobs/handlers/cmp/profileCompany";

async function main() {
  const sb = fullAccessServiceClient();
  const companiesGet = await sb.from("company_profile").select().eq("id", 1635);

  if (companiesGet.error || companiesGet.data.length < 1) {
    console.log("failed to get companies", companiesGet.error);
    throw companiesGet.error;
  }

  const companies = companiesGet.data;

  // const company = companies[0]

  for (const company of companies) {
    try {
      const cmpLocation = await geocodeCompany(company.web_summary!);
      const cmpUpdate = await sb
        .from("company_profile")
        .update({
          hq_geo: cmpLocation.hq_geo,
          hq_lon: cmpLocation.hq_lon,
          hq_lat: cmpLocation.hq_lat,
        })
        .eq("id", company.id);
      console.log("finished: ", company.name);
    } catch (error) {
      console.error("Failed: ", company.id, error);
    }
  }
  return;
}

main();
