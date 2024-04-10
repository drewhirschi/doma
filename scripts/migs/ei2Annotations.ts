import axios from "axios"
import { buildScaledPostionFromContractLines } from "@/helpers"
import { fullAccessServiceClient } from '@/supabase/ServerClients'
import path from 'path'

const sb = fullAccessServiceClient()

async function main() {

    const parlets = await sb.from('parslet').select('*, formatters(*)')

    if (parlets.error) {
        console.error(parlets.error)
        return
    
    }

    parlets.data?.forEach((p) => {
        console.log(p.formatters.length, p.key)
    })
    // const annotations = await sb.from('annotation').select('*')



   

    
}

main()

