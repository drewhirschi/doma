import { getDocument } from 'pdfjs-dist';

interface TextItem {
    str: string;
    x: number;
    y: number;
}

async function extractTextFromPDF(pdfPath: string) {
    const pdf = await getDocument(pdfPath).promise;

    const numPages = pdf.numPages;
    console.log(`Number of Pages: ${numPages}`);

    const textItems:TextItem[] = []
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        console.log(`Page ${pageNum}:`);
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

const pdfPath = 'docs/github.pdf'; // Replace with your PDF file path
const text = await extractTextFromPDF(pdfPath);

const lines:string[] = []
let currentLine = ""
let currentY = 0
for (const item of text) {
    if (item.y !== currentY) {
        lines.push(currentLine)
        currentLine = ""
        currentY = item.y
    }
    currentLine += item.str
}

lines.forEach(line => console.log(line))
