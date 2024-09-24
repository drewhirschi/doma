import { Queue, Worker } from "bullmq";

import Redis from "ioredis";

require("dotenv").config({ path: "./.env.local" });

async function main() {
  // const queue = new Queue('industry')

  // const sb = fullAccessServiceClient()
  // const insert = await sb.from("transaction_search_res").select().order("id", { ascending: false }).eq("linked", false).limit(10)

  // if (insert.error) {
  //     console.log("failed to get trans search res", insert.error)
  //     throw insert.error
  // }

  // await queue.addBulk(insert.data?.map(transaction => ({
  //     name: "transaction_linking",
  //     data: {
  //         trans_news_id: transaction.id,
  //     }
  // })) ?? [])

  console.log(process.env.UPSTASH_REDIS_URL);
  const client = new Redis(process.env.UPSTASH_REDIS_URL!, {
    maxRetriesPerRequest: null,
  });

  const myQueue = new Queue("industry", {
    connection: client,
  });

  const newJob = await myQueue.add("company_discovery", {
    hello: "active",
  });

  // const jobGet = await myQueue.getJob(newJob.id);
  // console.log(await jobGet.getState());
  
  // const worker = new Worker("company", async (job) => {
  //   console.log(job.data);
  // }, {
  //   connection: client,
  //   concurrency: 1
  // } )
  
  // console.log("DONE");
  // myQueue.close()
  client.disconnect();
}

main();
