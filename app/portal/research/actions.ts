"use server"

import { revalidatePath } from "next/cache"
import { serverActionClient } from "@/supabase/ServerClients"

export async function createProject(title:string) {
    const sb = serverActionClient()


    const { data, error } = await sb
        .from('ib_projects')
        .insert([{ title }])
        .select()
        .single()


        revalidatePath('/portal/research')

    return { data, error }

}