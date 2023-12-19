import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import path from 'path';
import unzipper from 'unzipper';

export async function unzipTenantFile(supabase:SupabaseClient, filepath: string) {

    const { data: sessionData } = await supabase.auth.getSession()
    const { data: userData } = await supabase.from("profile").select("*").eq("id", sessionData?.session?.user.id).single()

    

    const bucket = userData?.tenant_id;

    const filePathWithoutName = filepath.substring(0, filepath.lastIndexOf('/'));



    try {
        const url = `${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${filepath}`;

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'apiKey': process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });

        response.data
            .pipe(unzipper.Parse())
            .on('entry', function (entry: unzipper.Entry) {
                const fileName = entry.path;
                const type = entry.type; // 'Directory' or 'File'
                if (fileName.startsWith("__MACOSX") || fileName.includes(".DS_Store")) {
                    return; // Skip the entry
                }

                const fullPath = path.join(filePathWithoutName, fileName);

                if (type === 'File') {
                    let chunks: Buffer[] = [];
                    entry.on('data', (chunk: Buffer) => chunks.push(chunk));
                    entry.on('end', async () => {
                        let fileBuffer = Buffer.concat(chunks);
                        let { error } = await supabase.storage.from(bucket).upload(fullPath, fileBuffer);
                        if (error) console.error('Error uploading file:', error);
                    });
                } else {
                    entry.autodrain();
                }
            })
            .on('error', (err: any) => console.error('Error while unzipping:', err))
            .on('finish', () => {
                console.log('Finished unzipping')
            });
        const { data, error } = await supabase.storage.from(bucket).remove([filepath]);

        if (error) {
            console.error(error);
            throw new Error(error.message);
        }
        console.log(data);
    } catch (error) {
        console.error('Error in streaming and unzipping:', error);
    }
}