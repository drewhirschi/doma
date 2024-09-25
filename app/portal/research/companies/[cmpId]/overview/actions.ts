"use server"

import { IndustryQueueClient } from '@/backend/services/jobs/industry-queue';
import { actionWithNotification } from '@/ux/clientComp';
import { revalidatePath } from 'next/cache';
import { serverActionClient } from '@/shared/supabase-client/ServerClients';

export async function queueFindIndustryCompanies(cmpId: number) {

    const queue = new IndustryQueueClient()
    actionWithNotification(() => queue.companyDiscovery(cmpId), {})
    queue.close()


}

export async function queueFindIndustyActivity(cmpId: number) {
    const queue = new IndustryQueueClient()

    actionWithNotification(() => queue.transactionDiscovery(cmpId), {})


    queue.close()

}

export async function queueCompanyProfiling(url: string) {
    const queue = new IndustryQueueClient()



    actionWithNotification(() => queue.scrapeCompanyWebsite(url), {})
    queue.close()


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