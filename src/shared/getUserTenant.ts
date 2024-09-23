import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserTenant(supabase:SupabaseClient):Promise<string |null> {

    const userRes = await supabase.auth.getUser()

    if (userRes.error) {
        return null
    }

    return userRes.data.user?.app_metadata.tenant_id || null
  
}