import "dotenv/config";

import { Job, Worker } from 'bullmq';
import { reduceCompanyPagesToProfile, scrapeCompanyWebsite } from "./handlers/scrapeCompanyWebsite.js";

import { Redis } from "ioredis";
import { companyDiscovery } from "./handlers/companyDiscovery.js";
import { transactionCompanyLinking } from "./handlers/transactionLinking.js";
import { transactionDiscovery } from "./handlers/transactionDiscovery.js";

const redisConnection = new Redis(process.env.REDIS_URL!, {
    // tls: {},
    maxRetriesPerRequest: null,
});

const machineToken = process.env.MACHINE_NAME;
if (!machineToken) {
    throw new Error('MACHINE_NAME is not set');
}


const worker = new Worker('industry', async (job: Job) => {
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
                rv = await job.moveToFailed(new Error('unknown_job_name'), job.token || machineToken);
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
    concurrency: 10
});

