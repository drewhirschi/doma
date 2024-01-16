import { ScaledPosition } from "react-pdf-highlighter";

type Rect = {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    width: number;
    height: number;
    pageNumber: number;
};



function calculateBoundingRect(rects: Rect[]): Rect | null {
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

function buildScaledPostionFromContractLines(contractLines: ContractLine_SB[]): ScaledPosition {
    const rects = contractLines.map(rect => ({
        x1: rect.x1,
        x2: rect.x2,
        y1: rect.y1,
        y2: rect.y2,
        width: 1000, 
        height: 1200, // Assuming constant height
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


export function buildAnnotationFromExtraction(ei: ExtractedInformation_SB & { contract_line: ContractLine_SB[] }) {

    return {
        position: buildScaledPostionFromContractLines(ei.contract_line),
        id: ei.id,
        text: ei.data as string,
        parslet_id: ei.parslet_id
    }
}