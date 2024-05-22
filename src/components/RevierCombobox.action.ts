"use server"

import { revalidatePath } from "next/cache"
import { serverActionClient } from "@/supabase/ServerClients"

export async function updateContractAssignment(assigneeId: string, contractId: string) {
    const supabase = serverActionClient()

    await supabase.from("contract").update({ assigned_to: assigneeId }).eq("id", contractId)
    revalidatePath("/")
}