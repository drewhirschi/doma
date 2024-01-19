import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

import { TextItem } from "pdfjs-dist/types/src/display/api"

export async function extractTextFromPDF(pdfPath: string) {
    const pdf = await getDocument(pdfPath).promise;

    const numPages = pdf.numPages;
    console.log(`Number of Pages: ${numPages}`);
    console.log("dimensions", (await pdf.getPage(1).then(page => page.getViewport({ scale: 1.0 }))).rawDims)

    const textItems: TextItem[] = [];
    // for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    // console.log(`Page ${pageNum}:`);
    // @ts-ignore
    const {pageHeight, pageWidth} = await page.getViewport({ scale: 1.0 }).rawDims
    // @ts-ignore
    const { str, transform,  } = textContent.items[0];
    const x = transform[4];
    const y = transform[5];
    console.log(textContent.items[0])
    
    
    console.log({
        x1: x * 4/3,
        // @ts-ignore
        x2: (x + textContent.items[0].width) * 4/3,
        // @ts-ignore
        y1:  (pageHeight * 4/3) - ((y + textContent.items[0].height) * 4/3)  ,
        y2:  (pageHeight * 4/3) - (y * 4/3) ,
    })
    // textContent.items.forEach((item) => {
    //     console.log(item)
    //     // console.log(`Text: ${str}, Coordinates: (${x}, ${y})`);
    //     textItems.push({ str, x, y })
    // });
    // }
    return textItems
}

extractTextFromPDF("https://utlmfaaustebkmpcwlhx.supabase.co/storage/v1/object/sign/1a026946-561d-4d35-8fc5-de612378daef/projects/24f63208-11b1-45c0-a435-e43cfff6de14/AI%20Due%20Diligence%20Testing/Test%20Due%20Diligence%20TTG-IT%20Contracts/Charted%20by%20Ezra/Imagis%20Technologies%20Contract.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiIxYTAyNjk0Ni01NjFkLTRkMzUtOGZjNS1kZTYxMjM3OGRhZWYvcHJvamVjdHMvMjRmNjMyMDgtMTFiMS00NWMwLWE0MzUtZTQzY2ZmZjZkZTE0L0FJIER1ZSBEaWxpZ2VuY2UgVGVzdGluZy9UZXN0IER1ZSBEaWxpZ2VuY2UgVFRHLUlUIENvbnRyYWN0cy9DaGFydGVkIGJ5IEV6cmEvSW1hZ2lzIFRlY2hub2xvZ2llcyBDb250cmFjdC5wZGYiLCJpYXQiOjE3MDU0MzYxMTksImV4cCI6MTcwODAyODExOX0.VpBbM7ROY3_nGYgIOfhl4ZggHQALBQrMzFtTDLQPWc4&t=2024-01-16T20%3A15%3A17.843Z")

// export async function test() {

//     const pdf = await getDocument('https://utlmfaaustebkmpcwlhx.supabase.co/storage/v1/object/sign/1a026946-561d-4d35-8fc5-de612378daef/projects/24f63208-11b1-45c0-a435-e43cfff6de14/AI%20Due%20Diligence%20Testing/Test%20Due%20Diligence%20TTG-IT%20Contracts/Charted%20by%20Ezra/Imagis%20Technologies%20Contract.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiIxYTAyNjk0Ni01NjFkLTRkMzUtOGZjNS1kZTYxMjM3OGRhZWYvcHJvamVjdHMvMjRmNjMyMDgtMTFiMS00NWMwLWE0MzUtZTQzY2ZmZjZkZTE0L0FJIER1ZSBEaWxpZ2VuY2UgVGVzdGluZy9UZXN0IER1ZSBEaWxpZ2VuY2UgVFRHLUlUIENvbnRyYWN0cy9DaGFydGVkIGJ5IEV6cmEvSW1hZ2lzIFRlY2hub2xvZ2llcyBDb250cmFjdC5wZGYiLCJpYXQiOjE3MDUxOTU5NDEsImV4cCI6MTcwNzc4Nzk0MX0.Pkc8RuBzMO0-lGqP0QgybNEhogPeWt0CoRgIm_2O6y8&t=2024-01-14T01%3A32%3A19.820Z').promise;

//     const numPages = pdf.numPages;
//     console.log(pdf.getPage(1));


// }

// test()



