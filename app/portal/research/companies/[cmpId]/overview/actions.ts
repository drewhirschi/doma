"use server"

import { IndustryQueueClient } from '@/backend/services/jobs/industry-queue';

export async function queueFindIndustryCompanies(cmpId: number) {

    const queue = new IndustryQueueClient()
    await queue.companyDiscovery(cmpId)
    queue.close()

}

export async function queueFindIndustyActivity(cmpId: number) {
    const queue = new IndustryQueueClient()
    await queue.transactionDiscovery(cmpId)
    queue.close()

}

export async function queueCompanyProfiling(url: string) {
    const queue = new IndustryQueueClient()
    await queue.scrapeCompanyWebsite(url)
    queue.close()


}

