import { serverClient } from "@/supabase/ServerClients";

interface Props {
    projectId: string
}

export default async function ChartTab(props: Props) {

    const supabase = serverClient()

    const { data, error } = await supabase.from("project").select("contract(contract_note(*))").eq("id", props.projectId)
    // .order("")
    .single()

   return (
       <div>
           <h1>ChartPageTab</h1>
       </div>
   );
}