import axios from "axios"
import { fullAccessServiceClient } from '@/supabase/ServerClients'
import path from 'path'

const sb = fullAccessServiceClient()

async function regenerateProjectContractsLines(projectId: string) {

    const projectq = await sb.from('project').select("*, contract(id, name)").eq('id', projectId).single()

    if (!projectq.data) {
        console.error('Error loading project:', projectq.error);
        return
    }

    const deletionq = await sb.from('contract_line').delete().in('contract_id', projectq.data.contract.map(p => p.id))

    projectq.data.contract.forEach(async (contract) => {

        if (path.extname(contract.name) !== '.pdf') {
            return
        }

        try {

            const res = await axios.post('https://xjedm27xqhz6bycbmrdwr4n2ve0ywpli.lambda-url.us-west-2.on.aws/', {
                contractId: contract.id
                
            })
            console.log(res.data)
        } catch (e) {
            console.log(`Failed on contract [${contract.id}]`, contract.name)
            console.error((e as any).response.data)
        }

    })

}

regenerateProjectContractsLines("2b3514bd-7ca7-4236-bf70-17cba9b6cd00")