import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.mjs';

export interface TextItem {
    str: string;
    x: number;
    y: number;
}

export async function extractTextFromPDF(pdfPath: string) {
    const pdf = await getDocument(pdfPath).promise;

    const numPages = pdf.numPages;
    console.log(`Number of Pages: ${numPages}`);

    const textItems:TextItem[] = []
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // console.log(`Page ${pageNum}:`);
        textContent.items.forEach((item: any) => {
            const { str, transform } = item;
            const x = transform[4];
            const y = transform[5];
            // console.log(`Text: ${str}, Coordinates: (${x}, ${y})`);
            textItems.push({ str, x, y })
        });
    }
    return textItems
}



