"use server"

import { serverActionClient } from "@/supabase/ServerClients"
import { unzipTenantFile } from "@/supabase/StorageServerFunctions"

export async function unzipFile(filepath: string) {
    const supabase = serverActionClient()

    return await unzipTenantFile(supabase, filepath)
    
}
