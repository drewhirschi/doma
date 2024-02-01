import { SupabaseClient } from '@supabase/supabase-js'
import { fullAccessServiceClient } from '@/supabase/ServerClients'

const supabase = fullAccessServiceClient()


type Rect = {
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    width: number,
    height: number,
    pageNumber: number,
}


export async function getAnnotationContractLines(supabase: SupabaseClient, annotation: Annotation_SB, contract: { height: number, width: number, id: string }) {
    //@ts-ignore
    const boundingRect: Rect = annotation.position?.boundingRect

    if (!boundingRect) {
        console.log(`Annotation: ${annotation.text}\n No bounding rect found\n\n`)
        return
    }

    const scaledBr = {
        x1: boundingRect.x1 * (contract.width / boundingRect.width),
        x2: boundingRect.x2 * (contract.width / boundingRect.width),
        y1: boundingRect.y1 * (contract.height / boundingRect.height),
        y2: boundingRect.y2 * (contract.height / boundingRect.height),
        width: contract.width,
        height: contract.height,
        pageNumber: boundingRect.pageNumber,
    }

    const topBound = scaledBr.y1
    const bottomBound = scaledBr.y2
    const tolerance = 0

    console.log(`looking for lines y1 lte ${topBound - tolerance} and y2 gte ${bottomBound + tolerance} and`)

    const linesq = await supabase.from('contract_line').select('*')
        .eq('contract_id', contract.id)
        .eq('page', scaledBr.pageNumber)
        .gte('y1', topBound - tolerance)
        .lte('y2', bottomBound + tolerance)

    return linesq.data
}

async function main() {
    const contractId = "7bcb5164-ae37-4b89-bdd2-083a33aeabc1"

    const { data: annotations, error: annotationsE } = await supabase.from('annotation').select('*').eq('contract_id', contractId)
    const { data: contractLines, error: contractLinesE } = await supabase.from('contract_line').select('*').eq('contract_id', contractId)

    if (!contractLines || !annotations) {
        console.error(annotationsE)
        return
    }


    const contractHeight = contractLines[0].page_height
    const contractWidth = contractLines[0].page_width



    annotations?.forEach(async (annotation) => {

        const contractLines = await getAnnotationContractLines( supabase, annotation, { height: contractHeight, width: contractWidth, id: contractId })

        console.log(contractLines?.map((line) => line.id))



    })
}

main()