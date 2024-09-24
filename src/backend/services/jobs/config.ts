export const industryQueueConfig = {
    queueName: "industry",
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "1"),
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
    },
    //this limiter will run one job every second
    // limiter: {
    //     max: parseInt(process.env.MAX_LIMIT || "1"),
    //     duration: parseInt(process.env.DURATION_LIMIT || "1000")
    // }
};