"use server"

import { revalidatePath } from "next/cache"
import { reviewContract } from "@/server/processContract"
import { serverActionClient } from "@/supabase/ServerClients"

export async function reviewContractAction(contractId:string) {
    const supabase = serverActionClient()

    reviewContract(supabase, contractId).then(console.log)
}

export async function deleteContractExtractedInfo(contractId:string, projectId:string) {
    const supabase = serverActionClient()

    const { data, error } = await supabase.from('extracted_information').delete().eq('contract_id', contractId)

    revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)

    
}