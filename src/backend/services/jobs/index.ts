require("dotenv").config({
  path: [".env.production", ".env.local", ".env"],
});

import { Job, Worker } from "bullmq";
import { JobDataType, JobType, jobSchemas } from "@shared/queues/industry-queue.types";

import { IndustryQueueClient } from "@shared/queues/industry-queue";
import Redis from "ioredis";
import { pathToFileURL } from "url";

async function main() {
  const industryQueue = new IndustryQueueClient();

  const processorUrl = pathToFileURL(__dirname + "/worker.js");

  const worker = new Worker<JobDataType>("industry", processorUrl, {
    connection: industryQueue.connection,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    // drainDelay: 60,
    concurrency: parseInt(process.env.BULLMQ_CONCURRENCY ?? "5"),
  });

  worker.on("active", (job) => {
    const schema = jobSchemas[job.name as JobType];
    if (!schema) {
      throw new Error(`Unknown job type: ${job.name}`);
    }
    const result = schema.safeParse(job.data);
    if (!result.success) {
      console.error("Bad job data", job.id);
      throw new Error(
        `Invalid job data for ${job.name}: ${result.error.message}`,
      );
    }


    console.log(`Got ${job.name}, id: ${job.id}`, job.data);
  });


  worker.on("completed", (job: Job) =>
    console.log(`Finished ${job.name}, id: ${job.id}`),
  );


  worker.on("failed", (job, err) =>
    console.error(`Failed ${job?.name}, id: ${job?.id}`, job?.data, err),
  );


}

main();
