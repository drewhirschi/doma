"use server"

import { convertProjectWordFiles } from "@/actions/convertWordFiles"
import { queueProjectContracts } from "@/actions/queueProject"
import { serverActionClient } from "@/supabase/ServerClients"

export async function queueProject(projectId: string) {
    await queueProjectContracts(projectId)
}

export async function convertWordFiles(projectId: string) {





    const sb = serverActionClient()

    await convertProjectWordFiles(sb, projectId)

  
}