"use server"

import { reviewContract } from "@/processContract"
import { serverActionClient } from "@/supabase/ServerClients"

export async function reviewContractAction(contractId:string) {
    const supabase = serverActionClient()

    reviewContract(supabase, contractId).then(console.log)
}