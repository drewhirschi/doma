import * as pdfjs from 'pdfjs-dist';

import { NextResponse } from 'next/server';

// await import('pdfjs-dist/build/pdf.worker.js');
// require('pdfjs-dist/build/pdf.worker')

export async function POST(req: Request, res: Response) {
  const pdf = await pdfjs.getDocument(
    'https://www.africau.edu/images/default/sample.pdf'
  ).promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  return NextResponse.json({ message: textContent }, { status: 200 });
}