"use server"

import { getUserTenant } from "@/shared/getUserTenant"
import { rFindFilenames } from "@/supabase/Storage"
import { revalidatePath } from "next/cache"
import { serverActionClient } from "@/supabase/ServerClients"

export async function deleteProject(projectId: string): Promise<any> {
    const supabase = serverActionClient()

    const { error } = await supabase
        .from("project")
        .delete()
        .match({ id: projectId })

    const tenantId = await getUserTenant(supabase)
    if (!tenantId) {
        throw new Error("failed to get tenant id")
    }

    const projectFiles = await rFindFilenames(supabase, tenantId, `projects/${projectId}`, [])


    if (projectFiles) {
        const deleteFilesRes = await supabase.storage.from(tenantId!).remove(projectFiles)
    } else {
        console.warn("Didn't get project files")
    }


    revalidatePath("/portal/projects")

    // return {  error }
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



