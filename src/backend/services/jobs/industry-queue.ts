import { Queue, QueueOptions, RepeatStrategy } from "bullmq";

import { JobDataType } from "./jobTypes";
import Redis from "ioredis";

export class IndustryQueueClient {
  private queue: Queue;
  private connection: Redis;

  constructor(opts?: QueueOptions) {
    if (!process.env.UPSTASH_REDIS_URL) {
      throw new Error("Missing UPSTASH_REDIS_URL");
    }

    this.connection = new Redis(process.env.UPSTASH_REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue<JobDataType>("industry", {
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

  async companyDiscovery(cmpId: number) {
    return await this.queue.add("company_discovery", { cmpId });
  }
  async transactionDiscovery(cmpId: number) {
    return await this.queue.add("transaction_discovery", { cmpId });
  }
  async scrapeCompanyWebsite(url: string, opts?: { force?: boolean }) {
    return await this.queue.add("scrape_company_website", { url, force: opts?.force });
  }
  async reduceCompanyPages(cmpId: number) {
    return await this.queue.add("reduce_company_pages", { cmpId });
  }
  async scrapeLogo(cmpId: number) {
    return await this.queue.add(
      "scrape_logo",
      { cmpId },
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
