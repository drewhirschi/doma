require('dotenv').config({
    path: ['.env.production','.env.local', '.env']
})

import { Job, RedisConnection, Worker } from 'bullmq';
import { JobDataType, JobType, jobSchemas } from "./jobTypes";
import { reduceCompanyPagesToProfile, scrapeCompanyWebsite } from "./handlers/scrapeCompanyWebsite";

import Redis from "ioredis";
import { companyDiscovery } from "./handlers/companyDiscovery";
import path from 'path';
import { pathToFileURL } from 'url';
import { scrapeCompanyLogos } from "./handlers/scrapeLogos";
import { transactionCompanyLinking } from "./handlers/transactionLinking";
import { transactionDiscovery } from "./handlers/transactionDiscovery";

async function main() {


    if (!process.env.UPSTASH_REDIS_URL) {
        throw new Error("Missing UPSTASH_REDIS_URL")
    }
    const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL, {
        maxRetriesPerRequest: null,
    })




    const processorUrl = pathToFileURL(__dirname + '/worker.js');

    const worker = new Worker<JobDataType>('industry', processorUrl , {
        connection: redisConnection,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
        // drainDelay: 60,
        concurrency: 5
    });

    worker.on("completed", (job:Job) =>
        console.log(`Finished ${job.name}, id: ${job.id}`)
    );
    worker.on("failed", (job, err) =>
        console.error(`Failed ${job?.name}, id: ${job?.id}`, job?.data, err)
    );
    worker.on("active", (job) => {
        console.log(`Got ${job.name}, id: ${job.id}`, job.data)
    })


}

main()