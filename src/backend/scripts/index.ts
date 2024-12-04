require("dotenv").config({ path: "./.env.local" });

import { IndustryQueueClient } from "@shared/queues/industry-queue";
import { fullAccessServiceClient } from "@shared/supabase-client/server";
import { scrapeArticles } from "~/services/jobs/industry/handlers/scrapeTransactions";

async function main() {

  const supabase = fullAccessServiceClient()

  const createCmp = await supabase.from("company_profile")
    .select()
    .eq("origin", "https://www.corporate.carrier.com")
    .single();

  if (createCmp.error) {
    throw createCmp.error
  }


  const q = new IndustryQueueClient()

  await q.scrapeCompanyWebsite(createCmp.data.id, { scrapeComps: false })

  await q.close();

}

main().catch(console.error);
