import { IndustryQueueClient } from "@shared/queues/industry-queue";
import { JobDataType } from "@shared/queues/industry-queue.types";
import { Queue } from "bullmq";
import Redis from "ioredis";

async function main() {
    console.warn("I haven't fully verified this works")
    const jobId = process.argv[2];
    if (isNaN(parseInt(jobId))) {
        console.error('must provide job id as cli arg');
        process.exit(1);
    }




    const localConnection = new Redis("127.0.0.1", {
        maxRetriesPerRequest: null,
    });
    const localIndustryQueue = new Queue<JobDataType>("industry", {
        connection: localConnection,
    });

    const prodConnection = new Redis(process.env.UPSTASH_REDIS_URL!, {
        maxRetriesPerRequest: null,
    });
    const prodIndustryQueue = new Queue<JobDataType>("industry", {
        connection: prodConnection,
    });

    try {
        const job = await prodIndustryQueue.getJob(jobId)

        if (!job) {
            throw new Error("Job not found")
        }


        const localAddJobJob = await localIndustryQueue.add(job.name, job.data, job.opts)
        await job.remove()
    } catch (error) {
        console.error("failed", error)
    }


    prodConnection.disconnect()
    localConnection.disconnect()


}

main()