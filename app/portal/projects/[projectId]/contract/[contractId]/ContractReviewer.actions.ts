"use server"

import { revalidatePath } from "next/cache"
import { runContractExtraction } from "@/server/extractionAgent"
import { serverActionClient } from "@/supabase/ServerClients"
import { sleep } from "@/utils"

export async function reviewContractAction(contractId: string) {
    const supabase = serverActionClient()

    runContractExtraction(supabase, contractId).then(console.log)
}
export async function completeContractAction(contractId: string) {
    const supabase = serverActionClient()

    const update = await supabase.from('contract').update({ completed: true }).eq('id', contractId).select().single()

    if (update.error) {
        console.error(update.error)
        return { error: update.error }
    }

    // maybe move this into an effect return so it doesn't reaload the pdf.
    revalidatePath(`/portal/projects/${update.data.project_id}`)
}

export async function deleteContractExtractedInfo(contractId: string, projectId: string) {
    const supabase = serverActionClient()

    const { data, error } = await supabase.from('extracted_information').delete().eq('contract_id', contractId)

    revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)


}