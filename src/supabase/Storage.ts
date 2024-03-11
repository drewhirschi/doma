import * as tus from 'tus-js-client'

import { SupabaseClient } from '@supabase/supabase-js';

export async function uploadTenantFile(supabase: SupabaseClient, fileName: string, file: File, callbacks?: {
    updatePercentage?: (percentage: number) => void

}) {
    const { data: sessionData } = await supabase.auth.getSession()
    const { data: userData } = await supabase.from("profile").select("*").eq("id", sessionData?.session?.user.id).single()


    return new Promise((resolve, reject) => {
        const uploadOptions = {
            endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
            // retryDelays: [0, 3000, 5000, 10000, 20000],
            retryDelays: [0, 3000, 5000],
            headers: {
                authorization: `Bearer ${sessionData.session?.access_token}`,
                'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
            metadata: {
                bucketName: userData?.tenant_id,
                objectName: fileName,
                contentType: file.type,
                cacheControl: "3600",
            },
            chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
            onError: function (error: any) {
                reject(error)
            },
            // onProgress: callbacks.onProgress ?? function (bytesUploaded: number, bytesTotal: number) {
            //     var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
            //     console.log(bytesUploaded, bytesTotal, percentage + '%')
            // },
            onChunkComplete: ((chunkSize: number, bytesAccepted: number, bytesTotal: number) => {
                if (callbacks && callbacks.updatePercentage) callbacks.updatePercentage((bytesAccepted / bytesTotal))
            }),

            onSuccess: function () {
                console.log('Download %s from %s', (upload.file as File).name ?? "missing file name", upload.url)
                resolve(upload.url)
            },
        }

        const upload = new tus.Upload(file, uploadOptions)


        // Check if there are any previous uploads to continue.
        return upload.findPreviousUploads().then(function (previousUploads) {
            // Found previous uploads so we select the first one.
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0])
            }

            // Start the upload
            upload.start()
        })
    })
}


export async function rFindFilenames(supabase: SupabaseClient, bucket: string, path: string, files: string[]) {

    const { data, error } = await supabase.storage.from(bucket).list(path)

    if (error) {
        throw new Error(error.message)
    }

    if (data) {
        for (const file of data) {
            //if it doesn't have an id then it's a folder
            if (!file.id) {
                await rFindFilenames(supabase, bucket, `${path}/${file.name}`, files)
            } else {
                files.push(`${path}/${file.name}`)
            }
        }
    }

    return files
}


