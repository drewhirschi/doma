import { fullAccessServiceClient } from '@/supabase/ServerClients'

const supabase = fullAccessServiceClient()

async function main() {

    const userId = "e51580f8-1b71-4040-beeb-70b5aab5a86a"
    const tenant_id = "7713591f-c233-47a4-a285-dd2a035195ba"

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)

    const { data: tenant, error: tenantError } = await supabase.from('tenant').select('*').eq('id', tenant_id).single()

    if (tenantError) {
        throw tenantError
    }

    const { data: userupdate, error: userUpdateError } = await supabase.auth.admin.updateUserById(
        userId,
        { app_metadata: { ...user.user?.app_metadata, tenant_id } }
    )

    // add tenant to user profile
    const {data: profileUpdate, error: profileUpdateError} = await supabase.from('profile').update({tenant_id}).eq('id', userId)




    if (userUpdateError || profileUpdateError) {
        console.error(userUpdateError || profileUpdateError)
    } else {
        console.log(`success, added ${userupdate.user.email} to ${tenant.name}`)
    }

}

main()
