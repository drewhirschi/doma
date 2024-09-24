import "dotenv/config";

import { Job, RedisConnection, Worker } from 'bullmq';
import { JobDataType, JobType, jobSchemas } from "./jobTypes";
import { reduceCompanyPagesToProfile, scrapeCompanyWebsite } from "./handlers/scrapeCompanyWebsite";

import Redis from "ioredis";
import { companyDiscovery } from "./handlers/companyDiscovery";
import { transactionCompanyLinking } from "./handlers/transactionLinking";
import { transactionDiscovery } from "./handlers/transactionDiscovery";

async function main() {


    if (!process.env.UPSTASH_REDIS_URL) {
        throw new Error("Missing UPSTASH_REDIS_URL")
    }
    const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL, {
        maxRetriesPerRequest: null,
    })





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
            default:
                throw new Error('unknown_job_name');
        }



    }, {
        connection: redisConnection,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
        // drainDelay: 60,
        concurrency: 15
    });

    worker.on("completed", (job) =>
        console.log(`Finished ${job.name}, id: ${job.id}`)
    );
    worker.on("failed", (job, err) =>
        console.log(`Failed ${job?.name}, id: ${job?.id}`, job?.data)
    );
    worker.on("active", (job) => {
        console.log(`Got ${job.name}, id: ${job.id}`, job.data)
    })


}

main()