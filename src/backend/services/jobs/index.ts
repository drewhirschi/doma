import "dotenv/config";

import { Job, Worker } from 'bullmq';
import { JobDataType, JobType, jobSchemas } from "./jobTypes.js";
import { reduceCompanyPagesToProfile, scrapeCompanyWebsite } from "./handlers/scrapeCompanyWebsite.js";

import { Redis } from "ioredis";
import { companyDiscovery } from "./handlers/companyDiscovery.js";
import { transactionCompanyLinking } from "./handlers/transactionLinking.js";
import { transactionDiscovery } from "./handlers/transactionDiscovery.js";

const redisConnection = new Redis(process.env.REDIS_URL!, {
    // tls: {},
    maxRetriesPerRequest: null,
});




const worker = new Worker<JobDataType>('industry', async (job: Job) => {
    const schema = jobSchemas[job.name as JobType];
    if (!schema) {
        throw new Error(`Unknown job type: ${job.name}`);
    }
    const result = schema.safeParse(job.data);
    if (!result.success) {
        console.error("Bad job data", job.id)
        throw new Error(`Invalid job data for ${job.name}: ${result.error.message}`);
    }


    try {

        console.log(`Got ${job.name}, id: ${job.id}`, job.data)

        let rv
        switch (job.name) {
            case 'company_discovery':
                rv = await companyDiscovery(job)
                break
            case 'scrape_company_website':
                rv = await scrapeCompanyWebsite(job)
                break
            case 'reduce_company_pages':
                rv = await reduceCompanyPagesToProfile(job)
                break
            case 'transaction_discovery':
                rv = await transactionDiscovery(job)
                break
            case 'transaction_linking':
                rv = await transactionCompanyLinking(job)
                break;

            default:
                throw new Error('unknown_job_name');
                break;
        }

        console.log(`Finished ${job.name}, id: ${job.id}`)
        return rv
    } catch (err) {
        console.log(`Failed ${job.name}, id: ${job.id}`, job.data)
        throw err
    }
}, {
    connection: redisConnection,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    // drainDelay: 60,
    concurrency: 15
});
