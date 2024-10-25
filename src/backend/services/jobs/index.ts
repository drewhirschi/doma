require("dotenv").config({
  path: [".env.production", ".env.local", ".env"],
});

import { Job, Worker } from "bullmq";
import { JobDataType, JobType, jobSchemas } from "@shared/queues/industry-queue.types";

import { IndustryQueueClient } from "@shared/queues/industry-queue";
import { LinkedInQueueClient } from "@shared/queues/linkedin-queue";
import { pathToFileURL } from "url";

async function main() {

  await initIndustryWorker();
  await initLinkedInWorker();


}


const jobStartHandler = (job: Job) => {
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
}

const jobEndHandler = (job: Job) => {
  console.log(`Finished ${job.name}, id: ${job.id}`);
}

const jobFailedHandler = (job: Job | undefined, err: Error) => {
  console.error(`Failed ${job?.name}, id: ${job?.id}`, job?.data, err);
}

async function initIndustryWorker() {
  const industryQueue = new IndustryQueueClient();

  const industryProcessorUrl = pathToFileURL(__dirname + "/industry/worker.js");

  const industryWorker = new Worker<JobDataType>("industry", industryProcessorUrl, {
    connection: industryQueue.connection,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    concurrency: parseInt(process.env.BULLMQ_CONCURRENCY ?? "5"),

  });

  industryWorker.on("active", jobStartHandler);
  industryWorker.on("completed", jobEndHandler);
  industryWorker.on("failed", jobFailedHandler);
}

async function initLinkedInWorker() {
  const linkedInQueue = new LinkedInQueueClient();

  const linkedinProcessorUrl = pathToFileURL(__dirname + "/linkedin/worker.js");

  const linkedinWorker = new Worker<JobDataType>("linkedin", linkedinProcessorUrl, {
    connection: linkedInQueue.connection,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 1000 },
    limiter: {
      max: 20,
      duration: 60_000,
    },
    concurrency: parseInt(process.env.BULLMQ_CONCURRENCY ?? "5"),
  });

  linkedinWorker.on("active", jobStartHandler);
  linkedinWorker.on("completed", jobEndHandler);
  linkedinWorker.on("failed", jobFailedHandler);
}

main();
