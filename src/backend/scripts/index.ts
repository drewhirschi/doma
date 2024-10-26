require("dotenv").config({ path: "./.env.local" });

import { scrapeArticles } from "~/services/jobs/industry/handlers/scrapeTransactions";

async function main() {
  console.log("Testing Company Acquisition Article Scraper");
  scrapeArticles(123)
  console.log("End of Test");
  return;
}



main();





