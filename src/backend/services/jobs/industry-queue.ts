import { Queue, QueueOptions, RepeatStrategy } from "bullmq";

import { JobDataType } from "./jobTypes";
import { industryQueueConfig } from "./config";

export class IndustryQueueClient {
    private queue: Queue;

    constructor(opts: QueueOptions) {
        this.queue = new Queue<JobDataType>(industryQueueConfig.queueName, {
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                },
            },
            ...opts
        },
        );
    }

    async enqueue(jobName: string, data: JobDataType) {
        await this.queue.add(jobName, data);

    }

    close() {
        return this.queue.close();
    }
}