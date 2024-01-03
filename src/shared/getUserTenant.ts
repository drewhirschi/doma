import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserTenant(supabase:SupabaseClient):Promise<string| null> {

    const sessionRes = await supabase.auth.getSession()

    if (sessionRes.error) {
        return null
    }

    const userId = sessionRes.data.session?.user.id
    const userTenantId = await supabase.from('profile').select('tenant_id').eq('id', userId).single()

    return  userTenantId.data?.tenant_id || null
  
}