import { fullAccessServiceClient } from '@/supabase/ServerClients'

const supabase = fullAccessServiceClient()

async function main() {

    const userId = "c46aa845-9384-43d7-ae14-2648ac694450"
    const tenant_id = "7713591f-c233-47a4-a285-dd2a035195ba"

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)

    const { data: userupdate, error } = await supabase.auth.admin.updateUserById(
        userId,
        { app_metadata: {...user.user?.app_metadata, tenant_id} }
    )



    if (error) {
        console.error(error)
    } else {
        console.log(userupdate)
    }

}

main()
