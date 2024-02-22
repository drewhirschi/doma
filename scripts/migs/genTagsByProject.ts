import axios from "axios"
import { fullAccessServiceClient } from '@/supabase/ServerClients'
import path from 'path'

const sb = fullAccessServiceClient()

const PROJECT_ID = "2b3514bd-7ca7-4236-bf70-17cba9b6cd00"

async function main() {
    const projectq = await sb.from('project').select("*, contract(id, name)").eq('id', PROJECT_ID).single()

    if (!projectq.data) {
        console.error('Error loading project:', projectq.error);
        return
    }


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



main()