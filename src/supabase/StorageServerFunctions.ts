import { Database } from "@/types/supabase";
import PQueue from "p-queue";
import { SUPABASE_URL } from "./envs";
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

            let fullPath = path.join(filePathWithoutName, fileName);

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
        const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${zipFilepath}`;

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

