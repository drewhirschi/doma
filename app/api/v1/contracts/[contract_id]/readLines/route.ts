import { NextRequest, NextResponse } from 'next/server'

import axios from "axios"
import pdfjs from '@/server/pdfjs'

export async function POST(req: Request) {



    const fileurl = "https://utlmfaaustebkmpcwlhx.supabase.co/storage/v1/object/sign/1a026946-561d-4d35-8fc5-de612378daef/projects/8d609182-6177-474b-b473-40f7a13f40dd/Charted%20by%20Ezra/Imagis%20Technologies%20Contract.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiIxYTAyNjk0Ni01NjFkLTRkMzUtOGZjNS1kZTYxMjM3OGRhZWYvcHJvamVjdHMvOGQ2MDkxODItNjE3Ny00NzRiLWI0NzMtNDBmN2ExM2Y0MGRkL0NoYXJ0ZWQgYnkgRXpyYS9JbWFnaXMgVGVjaG5vbG9naWVzIENvbnRyYWN0LnBkZiIsImlhdCI6MTcwNjE2NjM5NSwiZXhwIjoxNzA4NzU4Mzk1fQ.5VjbgseZ0C5WREbix9nlIUXM9h8Onew0Y5QA-ygaWyo&t=2024-01-25T07%3A06%3A35.435Z"
    const numPages = await axios.get(fileurl, {
        responseType: 'arraybuffer', headers: {
            'Accept-Encoding': 'gzip',
        }
    }).then(async res => {

        const pdfBuffer = Buffer.from(res.data);

        const pdf = await pdfjs.getDocument(new Uint8Array(pdfBuffer.buffer)).promise;

        return pdf.numPages;
    })

    return NextResponse.json({ npages: numPages }, { status: 200 });
}