import { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import chalk from 'chalk';
import { fullAccessServiceClient } from '@/supabase/ServerClients'
import { getContractLinesWithinAnnotation } from '@/helpers'

const supabase = fullAccessServiceClient()




async function main() {
    const contractId = "393141ef-6d76-4c37-9ba6-97cabd301afa"

    const { data: annotations, error: annotationsE } = await supabase.from('annotation').select('*').eq('contract_id', contractId).order('position->boundingRect->pageNumber', { ascending: true })
    const { data: contractLines, error: contractLinesE } = await supabase.from('contract_line').select('*').eq('contract_id', contractId)

    if (!contractLines || !annotations) {
        console.error(annotationsE)
        return
    }


    const contractHeight = contractLines[0].page_height
    const contractWidth = contractLines[0].page_width


    const TOLERANCE = 0.1

    annotations?.forEach(async (annotation) => {


        const contractLines = await getContractLinesWithinAnnotation( supabase, annotation, { height: contractHeight, width: contractWidth, id: contractId })
        // contractLines.filter((line) => line.page === annotation.position.boundingRect.pageNumber)

        console.log("".padStart(100, "-"))
        console.log(chalk.bold("annotation text".padStart(40, " ")))
        console.log(annotation.text)
        console.log("\n")
        
        const str = contractLines.map((line) => line.text).join("\n")
        
        console.log(chalk.bold("corresponding contract line text".padStart(50, " ")))
        console.log(str)
        console.log("\n")
        console.log("".padStart(100, "-"))




    })
}

main()