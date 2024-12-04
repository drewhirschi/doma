import { SandboxedJob } from "bullmq";

import Exa from "exa-js";
import { IndustryQueueClient } from "@shared/queues/industry-queue";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { z } from "zod";

export default async function handler(job: SandboxedJob) {
  const cmpId = job.data.cmpId;
  const context = job.data.context;

  const delay = 24 * 60 * 60 * 1000;
  await job.moveToDelayed(Date.now() + delay);
  throw new Error("Not implemented");
  return await findCompany(cmpId, context);
}

export async function findCompany(modelCmpId: number, context: any) {
  const sb = fullAccessServiceClient();
  const exa = new Exa(process.env.EXA_API_KEY);

  exa.searchAndContents;
}
