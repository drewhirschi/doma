"use server"

import { serverActionClient } from "@/supabase/ServerClients"
import { revalidatePath } from "next/cache"

export async function updateContractAssignment(assigneeId: string, contractId: string) {
    const supabase = serverActionClient()

    await supabase.from("contract").update({ assigned_to: assigneeId }).eq("id", contractId)
    revalidatePath("/")
}