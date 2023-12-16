import ContractView from "./ContractView"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

interface Params {
    id:string
}
export default async function Page({params}:{params:Params}) {

    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )    

    const { data, error } = await supabase.from("contract").select("*").eq("id", params.id).single()
    

    return <ContractView contract={data}/>




}