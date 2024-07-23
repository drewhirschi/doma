"use server"

import { revalidatePath } from "next/cache"
import { serverActionClient } from "@/supabase/ServerClients"
import { sleep } from "@/utils"
import { unzipTenantFile } from "@/supabase/StorageServerFunctions"

export async function unzipFileServerAction(filepath: string, project_id: string) {
    const supabase = serverActionClient()

     await unzipTenantFile(supabase, filepath) 
     revalidatePath(`/portal/projects/${project_id}`)
    
}
