import { JobType, jobSchemas } from "./jobTypes";
import { reduceCompanyPagesToProfile, scrapeCompanyWebsite } from "./handlers/scrapeCompanyWebsite";

import { SandboxedJob } from "bullmq";
import { companyDiscovery } from "./handlers/companyDiscovery";
import sandbox from "bullmq/dist/esm/classes/sandbox";
import { scrapeCompanyLogos } from "./handlers/scrapeLogos";
import { transactionCompanyLinking } from "./handlers/transactionLinking";
import { transactionDiscovery } from "./handlers/transactionDiscovery";

export default async function (job: SandboxedJob) {
    const schema = jobSchemas[job.name as JobType];
    if (!schema) {
        throw new Error(`Unknown job type: ${job.name}`);
    }
    const result = schema.safeParse(job.data);
    if (!result.success) {
        console.error("Bad job data", job.id)
        throw new Error(`Invalid job data for ${job.name}: ${result.error.message}`);
    }



    switch (job.name) {
        case 'company_discovery':
            return await companyDiscovery(job)
        case 'scrape_company_website':
            return await scrapeCompanyWebsite(job)
        case 'reduce_company_pages':
            return await reduceCompanyPagesToProfile(job)
        case 'transaction_discovery':
            return await transactionDiscovery(job)
        case 'transaction_linking':
            return await transactionCompanyLinking(job)
        case 'scrape_logo':
            return await scrapeCompanyLogos(job)
        default:
            throw new Error('unknown_job_name');
    }



};