import { SandboxedJob } from "bullmq";
import { companyDiscovery } from "./handlers/companyDiscovery";
import { reduceCompanyPagesToProfile } from "./handlers/profileCompany";
import { scrapeCompanyLogos } from "./handlers/scrapeLogos";
import {
  scrapeCompanyWebsite,
} from "./handlers/scrapeCompanyWebsite";
import { transactionCompanyLinking } from "./handlers/transactionLinking";
import { transactionDiscovery } from "./handlers/transactionDiscovery";

export default async function (job: SandboxedJob) {


  switch (job.name) {
    case "company_discovery":
      return await companyDiscovery(job);
    case "scrape_company_website":
      return await scrapeCompanyWebsite(job);
    case "reduce_company_pages":
      return await reduceCompanyPagesToProfile(job);
    case "transaction_discovery":
      return await transactionDiscovery(job);
    case "transaction_linking":
      return await transactionCompanyLinking(job);
    case "scrape_logo":
      return await scrapeCompanyLogos(job);
    default:
      throw new Error("unknown_job_name");
  }
}
