require("dotenv").config({ path: "./.env.local" });
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import Exa from "exa-js";

async function main() {
  console.log("Testing Company Acquisition Article Scraper");

  const sb = fullAccessServiceClient();

  // get the company (testing with AWP Safety)
  const cmpGet = await sb
    .from("company_profile")
    .select()
    .eq("id", 66)
    .single();
  if (cmpGet.error) {
    throw cmpGet.error;
  } else if (!cmpGet.data.web_summary) {
    throw new Error("Model Company summary not found");
  }

  const company = cmpGet.data;
  console.log("Company Name: ", company.name);

  // set up the exa api
  const exa = new Exa(process.env.EXA_API_KEY);

  // search for acquisition articles from exa
  const searchResults = await exa.search(`${company.name} acquisition`, {
    type: "auto",
    useAutoprompt: true,
    numResults: 2,
    category: "news",
    startPublishedDate: "2019-01-01",
  });

  console.log("Search Results", searchResults.results);

  // checking the origin of the articles
  searchResults.results.map((result) => {
    console.log("Title: ", result.title);
    console.log("URL: ", result.url);
  });

  // use gpt to qualify the articles to make sure they are about our company and also about acquisitions

  // use gpt to create summaries of the articles

  // insert the qualified articles into the database

  // use gpt to extract from the articles the buyer, seller, backer, amount, date, and reason

  // use gpt to create a description  of the transaction (company x buys company y on date for amount)

  // generate an embedding for the transaction description

  // compare the embedding with other transactions in the database to see if it is a duplicate transaction

  console.log("End of Test");
  return;
}

main();
