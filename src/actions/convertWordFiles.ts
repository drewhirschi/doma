import { IResp, rerm, rok } from "@/utils";

import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import axios from "axios";
import { getUserTenant } from "@/shared/getUserTenant";

export async function convertToPdf(file: File): Promise<IResp<Blob>> {
    const formData = new FormData();
    formData.append('files', file);

    try {

        const res = await axios.post("https://audio.atlasai.tools/forms/libreoffice/convert", formData, {
            auth: {
                password: process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD!,
                username: process.env.GOTENBERG_API_BASIC_AUTH_USERNAME!
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            responseType: "arraybuffer"
        })

        if (res.status > 199 && res.status < 300) {
            return rok(res.data)
        }

        return rerm("Gotenberg gave a bad response", res.data)
    } catch (error) {
        return rerm("Unknown error calling Gotenberg", error as any)
    }

}
export async function convertProjectWordFiles(supabase: SupabaseClient<Database>, project_id: string) {

    console.log("in ss converter function")
    const tenantId = await getUserTenant(supabase)





    const contractq = await supabase.from('contract').select('*').eq('project_id', project_id)

    if (contractq.error) {

        console.error('Error loading contract', contractq.error);
        throw contractq.error
    }

    const wordContracts = contractq.data.filter(c => c.name.toLowerCase().endsWith('.docx') || c.name.toLowerCase().endsWith('.doc'))
    // const c = wordContracts[0]
    const proms = wordContracts.map(async c => {

        const file = await supabase.storage.from(tenantId!).download(c.name)

        if (file.error) {

            console.error('Error downloading file', file.error);
            throw file.error
        }

        const wordFile = new File([file.data], c.name)

        const pdf = await convertToPdf(wordFile)

        if (pdf.error) {

            console.error('Error converting file', pdf.error);
            throw pdf.error
        }




        await supabase.storage.from(tenantId!).upload(c.name.substring(0, c.name.lastIndexOf('.')) + '.pdf', pdf.ok)



    })


    await Promise.all(proms)



}


