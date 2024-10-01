require("dotenv").config({ path: "./.env.local" });

import { findSimilarCompanies } from "~/services/jobs/handlers/companyDiscovery";
import { fullAccessServiceClient } from "@shared/supabase-client/server";
import { geocodeCompany } from "~/services/jobs/handlers/geocodeHeadquaters";
import { scrapeSvgLogos } from "~/services/jobs/handlers/scrapeLogos";

async function main() {
  const sb = fullAccessServiceClient();
  const companiesGet = await sb.from("company_profile").select().gt("id", 1327);

  if (companiesGet.error) {
    console.log("failed to get companies", companiesGet.error);
    throw companiesGet.error;
  }

  const companies = companiesGet.data;

  // const company = companies[0]

  for (const company of companies) {
    try {
      await geocodeCompany(company.id);
      console.log("finished: ", company.name);
    } catch (error) {
      console.error("Failed: ", company.id, error);
    }
  }
  return;
}

main();
