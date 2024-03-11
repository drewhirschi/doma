import { fullAccessServiceClient } from '@/supabase/ServerClients'

const supabase = fullAccessServiceClient()

async function main() {

    const userId = "47ff043c-6b54-42e7-84cd-4029435ea460"
    const tenant_id = "565ee418-27bb-42c6-af96-4f78d8c476b3"

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
