"use server"

import { Queue } from 'bullmq';
import Redis from "ioredis"
import { revalidatePath } from 'next/cache';
import { serverActionClient } from '@/supabase/ServerClients';

const redisConnection = new Redis(process.env.REDIS_URL!, {
    // tls: {}
});

export async function queueFindIndustryCompanies(cmpId: number) {

    const queue = new Queue('industry', {
        connection: redisConnection,
    })

    try {

        queue.add("company_discovery", { cmpId })
    } catch (error) {

        console.error(error)
    }

}

export async function queueFindIndustyActivity(cmpId: number) {
    const queue = new Queue('industry', {
        connection: redisConnection,
    })

    try {
        queue.add("transaction_discovery", { cmpId })

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
        console.log("added scrape_company_website", url)
    } catch (error) {
        console.error(error)

    }

}

export async function setModelCompany(cmpId: number, projectId: number) {
    const sb = serverActionClient()

    const update = await sb.from("ib_projects").update({ model_cmp: cmpId }).eq("id", projectId)


    if (update.error) {
        console.log(update.error)
        throw update.error
    }

    revalidatePath(`/portal/research/${projectId}`)


}