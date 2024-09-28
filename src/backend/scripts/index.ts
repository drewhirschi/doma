require("dotenv").config({ path: "./.env.local" });

import { findSimilarCompanies } from "~/services/jobs/handlers/companyDiscovery";
import { fullAccessServiceClient } from "@shared/supabase-client/server";
import { scrapeSvgLogos } from "~/services/jobs/handlers/scrapeLogos";

async function main() {

  const sb = fullAccessServiceClient()
  const companiesGet = await sb.from("company_profile").select()
    .eq("id", 1250)

  if (companiesGet.error) {
    console.log("failed to get companies", companiesGet.error)
    throw companiesGet.error
  }

  const companies = companiesGet.data



  const company = companies[0]




  await findSimilarCompanies(company.id)
  return





}




main();


