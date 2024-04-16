import 'dotenv/config'

import Zuva, { ExtractionStatusEnum } from '@/zuva';

import { Readable } from 'stream';
import axios from "axios";
import { fullAccessServiceClient } from '@/supabase/ServerClients';
import { sleep } from '@/utils';

async function main() {

    const contractId = "f4dd221e-9faa-4e47-a6d8-fa28eff09dd4"

    const sb = fullAccessServiceClient()

    const contract = await sb.from('contract').select().eq('id', contractId).single()

    if (contract.error) {
        throw contract.error
    }



    const bucket = contract.data.tenant_id
    const filepath = contract.data.name;

    const url = `${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${filepath}`;

    const fileStreamResponse = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apiKey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            "Accept-Encoding": "gzip, deflate",
        }
    });

    const stream: Readable = fileStreamResponse.data

    const zuvaApi = Zuva.getInstance();

    const zuvaFile = await zuvaApi.uploadFile(stream)

    if (!zuvaFile?.file_id) {
        throw new Error('Failed to upload file to Zuva')
    }

    const extraction = await zuvaApi.createExtraction([zuvaFile?.file_id])

    if (extraction.error) {
        throw new Error('Failed to create extraction')
    }

    

    while (true) {

        const results = await zuvaApi.getExtractionStatuses(extraction.ok.file_ids.map(f => f.request_id))

        if (results.error) {
            console.log(results.error)
            throw results.error
        }

        const hasIncomplete = Object.values(results.ok.statuses).some(r => r.status === ExtractionStatusEnum.processing || r.status === ExtractionStatusEnum.queued)

        if (!hasIncomplete) {
            console.log("All extractions complete")
            break
        }

        console.log("sleeping 5 seconds")
        await sleep(5000)
    }
}


main()