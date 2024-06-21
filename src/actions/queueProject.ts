import { ContractJobTypes } from "@/types/enums";
import { serverActionClient } from "@/supabase/ServerClients"

type NewContractJob = Omit<ContractJob_SB, 'id' | 'created_at' | 'updated_at' | 'status' | 'run_data'>;


export async function queueProjectContracts(projectId: string) {
    console.log(`adding ${projectId} to queue`)

    const sb = serverActionClient()

    const project = await sb.from("project").select("*, contract(id, completed)").eq("id", projectId).single()

    if (project.error) throw project.error

    await queueContracts(project.data.contract.filter(c => !c.completed).map(c => c.id))

}

export async function queueContracts(contractIds: string[]) {
    const sb = serverActionClient()

    const jobs: NewContractJob[] = contractIds.map(c => ({
        contract_id: c,
        job_type: ContractJobTypes.FullReview,
        payload: null
    }))


    const jobInsert = await sb.from("contract_job_queue").insert(jobs)

    if (jobInsert.error) {
        console.log("job insert error", jobInsert.error)
        throw jobInsert.error
    }
}