import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api"

import { Database } from "@/types/supabase";
import PQueue from "p-queue";
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import path from 'path';
import { sleep } from "@/utils";
import unzipper from 'unzipper';

export async function unzipTenantFile(supabase: SupabaseClient<Database>, zipFilepath: string) {

    const jobQueue = new PQueue({ concurrency: 20 });


    const { data: sessionData } = await supabase.auth.getSession()
    const { data: userData } = await supabase.from("profile").select("*").eq("id", sessionData?.session?.user.id!).single()

    if (!userData) {
        throw new Error("User not found")
    }

    const bucket = userData.tenant_id as string;

    const filePathWithoutName = zipFilepath.substring(0, zipFilepath.lastIndexOf('/'));

    function handleZipEntry(entry: unzipper.Entry) {
        return new Promise<number>((resolve, reject) => {

            const fileName = entry.path;
            const type = entry.type; // 'Directory' or 'File'
            if (fileName.startsWith("__MACOSX") || fileName.includes(".DS_Store")) {
                resolve(0)
                return
            }

            const fullPath = path.join(filePathWithoutName, fileName);

            if (type === 'File') {
                let chunks: Buffer[] = [];
                entry.on('data', (chunk: Buffer) => chunks.push(chunk));
                entry.on('end', async () => {
                    let fileBuffer = Buffer.concat(chunks);
                    await handleFileIngestion(supabase, jobQueue, userData!.tenant_id!, fullPath, fileBuffer);
                    resolve(1)
                });
            } else {
                entry.autodrain();
                resolve(0)
            }

        })

    }



    try {
        const url = `${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${zipFilepath}`;

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'apiKey': process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });

        return new Promise((resolve, reject) => {

            let importedFileCount = 0;
            response.data
                .pipe(unzipper.Parse())
                .on('entry', async (entry: unzipper.Entry) => {
                    importedFileCount += await handleZipEntry(entry);
                })
                .on('error', (err: any) => console.error('Error while unzipping:', err))
                .on('finish', async () => {
                    const { data, error } = await supabase.storage.from(bucket).remove([zipFilepath]);

                    if (error) {
                        console.error(error);
                        reject(error.message);
                    }

                    resolve(importedFileCount);

                });
        })

    } catch (error) {
        console.error('Error in streaming and unzipping:', error);
    }
}




async function handleFileIngestion(supabase: SupabaseClient, jobQueue: any, tenantId: string, filepath: string, fileBuffer: Buffer) {




    // let { data: uploadData, error: fileuploadError } = await rateLimitter(() => supabase.storage.from(tenantId).upload(filepath, fileBuffer))
    let { data: uploadData, error: fileuploadError } = await jobQueue.add(() => supabase.storage.from(tenantId).upload(filepath, fileBuffer))
    if (fileuploadError) console.error('Error uploading file:', fileuploadError);






}

export async function readPdfLines(pdfBuffer: Buffer): Promise<void> {
    // console.log("reading a pdf")
    // const pdf = await pdfjs.getDocument(pdfBuffer).promise;

    // const numPages = pdf.numPages;

    // for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    //     const page = await pdf.getPage(pageNum);
    //     const textContent = await page.getTextContent();
    //     const viewport = page.getViewport({ scale: 1 });

    //     textContent.items.forEach((content:any, index:number) => {

    //         if (!content.hasOwnProperty("str")) {
    //             return 
    //         }

    //         const item:TextItem = content as TextItem

    //         const text = item.str;
    //         const transform = item.transform;

    //         // PDF.js uses a coordinate system where the origin is at the bottom-left corner.
    //         // The transform array contains [scaleX, skewY, skewX, scaleY, translateX, translateY]
    //         const x = transform[4];
    //         const y = viewport.height - transform[5];
    //         const width = item.width;
    //         const height = item.height;

    //         const lineData = {
    //             text: text,
    //             xStart: x,
    //             yStart: y,
    //             xEnd: x + width,
    //             yEnd: y - height,
    //             pageHeight: viewport.height,
    //             pageWidth: viewport.width,
    //             page: pageNum
    //         };

    //         console.log(lineData);
    //     });
    // }

}