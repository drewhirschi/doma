import type { LTWHP, Scaled, ScaledPosition } from "@/components/PdfViewer";

import { CharacterSpan } from "./zuva";
import { Database } from "./types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export function spanToScaledPosition(spans: CharacterSpan[], height: number, width: number): ScaledPosition | null {


    const rects: Scaled[] = spans.map((span: CharacterSpan) => ({
        height: height * 4.1,
        width: width * 4.1,
        x1: (span.bounds?.left ?? 0),
        x2: (span.bounds?.right ?? 0),
        y1: (span.bounds?.top ?? 0),
        y2: (span.bounds?.bottom ?? 0),
        pageNumber: span.pages.start
    }))

    const boundingRect = calculateBoundingRect(rects)

    if (!boundingRect) return null

    const position: ScaledPosition = {
        boundingRect,
        rects,
        pageNumber: spans[0].pages.start
    }



    return position

}

function calculateBoundingRect(rects: Scaled[]): Scaled | null {
    if (rects.length === 0) return null;

    let minX1 = rects[0].x1;
    let maxX2 = rects[0].x2;
    let minY1 = rects[0].y1;
    let maxY2 = rects[0].y2;
    let width = rects[0].width;
    let height = rects[0].height;
    let pageNumber = rects[0].pageNumber;

    rects.forEach(rect => {
        minX1 = Math.min(minX1, rect.x1);
        maxX2 = Math.max(maxX2, rect.x2);
        minY1 = Math.min(minY1, rect.y1);
        maxY2 = Math.max(maxY2, rect.y2);
    });

    return { x1: minX1, x2: maxX2, y1: minY1, y2: maxY2, width, height, pageNumber };
}

export function buildScaledPostionFromContractLines(contractLines: ContractLine_SB[]): ScaledPosition {
    const rects = contractLines.map((rect: ContractLine_SB) => ({
        x1: rect.x1,
        x2: rect.x2,
        y1: rect.y1,
        y2: rect.y2,
        width: rect.page_width,
        height: rect.page_height,
        pageNumber: rect.page
    }));

    const pageNumber = rects.length > 0 ? rects[0].pageNumber : 0;
    const boundingRect = calculateBoundingRect(rects.filter(rect => rect.pageNumber === pageNumber));

    return {
        rects: rects,
        pageNumber: pageNumber,
        boundingRect: boundingRect || { x1: 0, x2: 0, y1: 0, y2: 0, width: 0, height: 0, pageNumber: 0 }
    };
}



export async function getContractLinesWithinAnnotation(supabase: SupabaseClient<Database>, annotation: Annotation_SB, contract: { height: number, width: number, id: string }): Promise<ContractLine_SB[]> {
    //@ts-ignore
    const boundingRect: Rect = annotation.position?.boundingRect

    if (!boundingRect) {
        throw `Annotation: ${annotation.text}\n No bounding rect found\n\n`
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

    // console.log(`looking for lines y1 lte ${topBound - tolerance} and y2 gte ${bottomBound + tolerance} and`)

    const linesq = await supabase.from('contract_line').select('*').throwOnError()
        .eq('contract_id', contract.id)
        .eq('page', scaledBr.pageNumber)
        .gte('y1', topBound - tolerance)
        .lte('y2', bottomBound + tolerance)



    return linesq.data ?? []
}


