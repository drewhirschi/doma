"use server"

import { revalidatePath } from "next/cache"
import { serverActionClient } from "@/supabase/ServerClients"

export async function deleteProject(projectId: string): Promise<any> {
    const supabase = serverActionClient()

    const { data, error } = await supabase
        .from("project")
        .delete()
        .match({ id: projectId })


    revalidatePath("/portal/projects")

    return { data, error }
}

export async function changeProjectStatus(projectId: string, status: boolean): Promise<any> {
    const supabase = serverActionClient()

    const { data, error } = await supabase
        .from("project")
        .update({ 'is_active': !status })
        .eq('id', projectId)


    revalidatePath("/portal/projects")

    return { data, error }
}