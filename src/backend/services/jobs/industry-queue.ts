import { Queue, QueueOptions, RepeatStrategy } from "bullmq";

import { JobDataType } from "./jobTypes";
import Redis from "ioredis";

export class IndustryQueueClient {
    private queue: Queue;

    constructor(opts?: QueueOptions) {
        this.queue = new Queue<JobDataType>("industry", {
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 3000
                },
            },
            ...opts,
            connection: new Redis(process.env.UPSTASH_REDIS_URL!, {
                maxRetriesPerRequest: null,
            })
        },
        );
    }

    async companyDiscovery(cmpId: number) {
        return await this.queue.add("company_discovery", { cmpId });
    }
    async transactionDiscovery(cmpId: number) {
        return await this.queue.add("transaction_discovery", { cmpId });
    }
    async scrapeCompanyWebsite(url: string) {
        return await this.queue.add("scrape_company_website", { url });
    }



    async enqueue(jobName: string, data: JobDataType) {
        return await this.queue.add(jobName, data);

    }
    async enqueueBulk(jobs: { name: string, data: JobDataType }[]) {
        return await this.queue.addBulk(jobs);
    }

    close() {
        return this.queue.close();
    }
}