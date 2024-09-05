"use server"

import { Queue } from 'bullmq';
import Redis from "ioredis"

const redisConnection = new Redis(process.env.REDIS_URL!, {
    // tls: {}
});

export async function queueFindIndustryCompanies(cmpId: string) {

    const queue = new Queue('industry', {
        connection: redisConnection,
    })

    try {

        queue.add("company_discovery", { cmpId })
    } catch (error) {

        console.error(error)
    }

}

export async function queueFindIndustyActivity(industry: string) {
    const queue = new Queue('industry', {
        connection: redisConnection,
    })

    try {
        queue.add("transaction_discovery", { industry: "Cloud-based communication systems" })

    } catch (error) {
        console.error(error)

    }

}

export async function queueCompanyProfiling(url: string) {
    const queue = new Queue('industry', {
        connection: redisConnection,
    })


    try {
        queue.add("scrape_company_website", { url })

    } catch (error) {
        console.error(error)

    }

}