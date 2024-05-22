import { serverActionClient } from "@/supabase/ServerClients"

type NewContractJob = Omit<ContractJob_SB, 'id' | 'created_at' | 'updated_at' | 'status'>;


export async function queueProjectContracts(projectId:string) {
    console.log(`adding ${projectId} to queue`)

    const sb = serverActionClient()

    const project = await sb.from("project").select("*, contract(*)").eq("id", projectId).single()

    if (project.error) throw project.error

    const jobs:NewContractJob[] = project.data.contract.filter(c => !c.completed).map(c => ({
        contract_id: c.id,
        job_type: 'full_contract_review',
        payload: null
    }))

    console.log(jobs)

    const jobInsert = await sb.from("contract_job_queue").insert(jobs)

    if (jobInsert.error) {
        console.log("job insert error", jobInsert.error)
        throw jobInsert.error
    }
    
}