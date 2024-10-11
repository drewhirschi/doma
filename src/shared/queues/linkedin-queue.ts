import { JobDataType, scrapeWebsiteSchema } from "./industry-queue.types";
import { Queue, QueueOptions, RepeatStrategy } from "bullmq";

import Redis from "ioredis";
import { z } from "zod";

export class LinkedInQueueClient {
    private queue: Queue;
    connection: Redis;

    constructor(opts?: QueueOptions) {

        const CONNECTION_URL = process.env.LOCAL_REDIS === 'true' ? "127.0.0.1" : process.env.UPSTASH_REDIS_URL

        if (CONNECTION_URL === undefined) {
            throw new Error("Set UPSTASH_REDIS_URL or LOCAL_REDIS");
        }

        this.connection = new Redis(CONNECTION_URL, {
            maxRetriesPerRequest: null,
        });

        this.queue = new Queue<JobDataType>("linkedin", {
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 10_000,
                },
            },
            ...opts,
            connection: this.connection,
        });
    }



    async getCompanyLinkedInProfile(cmpId: number, url: string) {
        return await this.queue.add(
            "get_li_profile",
            { cmpId, liProfileUrl: url },
            {
                attempts: 2,
            },
        );
    }

    async enqueue(jobName: string, data: JobDataType) {
        return await this.queue.add(jobName, data);
    }
    async enqueueBulk(jobs: { name: string; data: JobDataType }[]) {
        return await this.queue.addBulk(jobs);
    }




    async close() {
        await this.queue.close();
        this.connection.disconnect();
    }
}
