import { JobDataType, scrapeWebsiteSchema } from "./industry-queue.types";
import { Queue, QueueOptions, RepeatStrategy } from "bullmq";

import Redis from "ioredis";
import { z } from "zod";

export class IndustryQueueClient {
  private queue: Queue;
  connection: Redis;

  constructor(opts?: QueueOptions) {
    const CONNECTION_URL = process.env.LOCAL_REDIS === "true" ? "127.0.0.1" : process.env.UPSTASH_REDIS_URL;

    if (CONNECTION_URL === undefined) {
      throw new Error("Set UPSTASH_REDIS_URL or LOCAL_REDIS");
    }

    this.connection = new Redis(CONNECTION_URL, {
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
  async findCompany(cmpId: number, context: object) {
    return await this.queue.add("find_company", { cmpId, context });
  }
  async transactionDiscovery(cmpId: number) {
    return await this.queue.add("transaction_discovery", { cmpId });
  }
  async scrapeArticles(cmpId: number) {
    return await this.queue.add("scrape_ma_articles", { cmpId });
  }
  async scrapeCompanyWebsite(cmpId: number, opts?: { force?: boolean; scrapeComps?: boolean }) {
    const params = {
      cmpId,
      force: opts?.force,
      scrapeComps: opts?.scrapeComps,
    } as z.infer<typeof scrapeWebsiteSchema>;

    return await this.queue.add("scrape_company_website", params);
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
