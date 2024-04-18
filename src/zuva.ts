import { IResp, rerm, rok } from './utils';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import axios, { AxiosInstance } from 'axios';

import { Database } from './types/supabase';
import { Except } from 'type-fest';
import PQueue from 'p-queue';
import { Readable } from 'stream';
import { spanToScaledPosition } from './helpers';

export type ZuvaFile = {
    file_id: string;
    attributes: {
        "content-type": string;
        "sha-256": string;
    };
    permissions: string[];
    expiration: string;
    size: number;
};

export enum ExtractionStatusEnum {
    queued = 'queued',
    processing = 'processing',
    complete = 'complete',
    failed = 'failed',
}

type ExtractionFileItem = {
    file_id: string;
    field_ids: string[];
    request_id: string;
    status: ExtractionStatusEnum;
};

type CreateExtractionApiResponse = {
    file_ids: ExtractionFileItem[];
};

// type ExtractionStatus = {
//     file_id: string;
//     request_id: string;
//     status: string;
// }

type ErrorDetail = {
    code: string;
    message: string;
};

type StatusDetail = {
    file_id: string;
    status: ExtractionStatusEnum;
    request_id: string;
};

type ExtractionStatusesApiResponse = {
    errors: {
        [key: string]: { error: ErrorDetail }
    };
    num_errors: number;
    num_found: number;
    statuses: {
        [key: string]: StatusDetail
    };
};

type ExtractionResultApiResponse = {
    file_id: string;
    request_id: string;
    results: ExtractionResult[];
};

type ExtractionResult = {
    answers: Answer[]
    extractions: TextExtraction[]
    field_id: string
    field_name: string

}

type Answer = {
    option: string
    value: string
}

type TextExtraction = {
    currencies: CurrencyValues[]
    dates: DateValues[]
    defined_term: DefinedTerm
    durations: DurationValues[]
    spans: CharacterSpan[]
    text: string
}

type CurrencyValues = {
    value: string;
    symbol: string;
    precision: number;
};


type DateValues = {
    day: number;
    month: number;
    year: number;
};

type DefinedTerm = {
    term: string;
    spans: CharacterSpan[];
};

export type CharacterSpan = {
    bounds?: BoundingBoxSummary;
    bboxes: BoundingBoxesByPage[];
    end: number;
    pages: Span;
    score: number;
    start: number;
};

type BoundingBoxSummary = {
    bottom: number;
    left: number;
    right: number;
    top: number;
};

type BoundingBoxesByPage = {
    page: number;
    bounds: BoundingBoxSummary[];
};

type Span = {
    start: number;
    end: number;
};

type DurationValues = {
    unit: string;
    value: number;
};






class Zuva {
    private static instance: Zuva;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: 'https://us.app.zuva.ai/api/v2',
            timeout: 15000,
            headers: {
                // 'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ZUVA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            paramsSerializer: {
                indexes: null
            }
        });
    }

    public static getInstance(): Zuva {
        if (!Zuva.instance) {
            Zuva.instance = new Zuva();
        }
        return Zuva.instance;
    }

    private fields = {
        "Title": "668ee3b5-e15a-439f-9475-05a21755a5c1",
        "Parties": "f743f363-1d8b-435b-8812-204a6d883834",
        "Parties (Defined Term)": "98086156-f230-423c-b214-27f542e72708",
        "Effective Date": "5fbf6622-9e36-4919-b9f9-2d87c4c9630c",
        "Start Date": "8a02b433-2f41-4e39-b245-f124e01cfe90",
        "Date": "4d34c0ac-a3d4-4172-92d0-5fad8b3860a7",
        "Initial Term": "e211dec8-5c81-41e6-9ec1-ef21afde98a5",
        "Renewal": "c13f6b32-fafc-4ecd-8688-8956425acd5c",
        "Termination": "a891ced3-2694-475e-b2a5-4f9a6fa114fe",
        "Termination for Convenience": "f4d00efa-beb6-40c2-ba72-2371cd50f0d0",
        "License Grant": "674c5dd4-678d-470a-ba58-10775a96a95d",
        "Territory": "67df1c9b-de7a-450d-8d82-8e05d6b8472b",
        "Source Code Escrow": "e0151926-5dd4-4296-8730-7113f5f81673",
        "Invention Assignment": "6f7a3065-2b0e-4b0f-bba3-9d068390182d",
        "Joint Ownership of Intellectual Property": "890a134b-8e91-4042-9ea4-86be0f03c7bd",
        "Ownership of Intellectual Property (Broad)": "c25ae65b-4cb9-4ac6-b463-2271e39e045b",
        "Pricing": "00a2715b-70f4-4be8-9942-ce9707a43548",
        "Upfront/Initial Payments": "8d551489-ea79-44bf-8b5b-bfda46db5014",
        "Royalty Payments": "aadbf296-d01f-4712-8ee4-2bf378488778",
        "Warranty": "8261ee05-826e-4642-9eca-43d747a0cfc3",
        "Disclaimer of warranties": "f6413b34-9314-49a2-85c4-2b3e9ba551b4",
        "Limitation of Liability": "17b7fbda-d531-4a82-818c-964c731b21f0",
        "Limitation of Liability — Financial Cap": "eadb7d81-e7d4-46fe-b2fd-3972c07d5d36",
        "Indemnity": "292b0a57-596b-4904-acfa-c3f845eb2879",
        "Most Favored Nation": "d5596bb0-1bab-4569-a0a5-7d2117f19c44",
        "Exclusivity/Non-Compete": "1c67993f-c745-46c2-beb2-95035269df58",
        "Non-Solicit": "473457de-b82c-49b2-81a0-5b70303d6605",
        "Right of First Offer/Right of First Refusal": "857f240f-5191-4689-823b-3747dcf66434",
        "Change of Control": "5c971bd8-fc3b-4a26-8a95-674202871dfd",
        "Affiliate Definition": "4687bed5-b82a-40b6-8d56-068c1a60ee65",
        "Assignment": "99006174-7187-48d9-ac54-f99eb589367c",
        "40 Act Assignment": "469d3654-d95f-480c-8646-ffbda55b4182",
        "Direct or Indirect Assignment": "e626617c-5b8e-48ef-955b-0003ba441995",
        "Governing Law": "c83868ae-269a-4a1b-b2af-c53e5f91efca",
        "Governing Law (Full Paragraph)": "e98ac3eb-4dce-446e-91b4-36b8a3f1f22f"
    }


    public async uploadFile(fileStream: Readable): Promise<IResp<ZuvaFile>> {
        try {



            // const data = fs.createReadStream(filePath);
            const response = await this.axiosInstance.post<ZuvaFile>('/files', fileStream, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Accept': 'application/json',
                },
            });

            if (response.status !== 201) {

                throw response.data

            }
            return rok(response.data);


        } catch (error) {
            // Code to handle error
            console.log(error);
            return rerm("Failed to upload file", { error })
        }

    }

    public async createExtraction(fileIds: string[]): Promise<IResp<CreateExtractionApiResponse>> {

        try {

            const res: CreateExtractionApiResponse = {
                file_ids: []
            }

            for (let i = 0; i < Object.values(this.fields).length; i += 10) {

                const upperLimit = Math.min(i + 10, Object.values(this.fields).length)

                const response = await this.axiosInstance.post<CreateExtractionApiResponse>('/extraction', {
                    file_ids: fileIds,
                    field_ids: Object.values(this.fields).slice(i, upperLimit),
                });

                if (!(response.status >= 200 && response.status < 300)) {
                    throw response.data;
                }


                res.file_ids.push(...response.data.file_ids)

            }
            return rok(res)

        } catch (error) {
            console.log(error);
            return rerm("Failed to create extraction", { error })
        }
    }



    public async getExtractionStatuses(extractionRequestIds: string[]): Promise<IResp<ExtractionStatusesApiResponse>> {
        try {
            const response = await this.axiosInstance.get<ExtractionStatusesApiResponse>(`/extractions`, {
                params: {
                    request_id: extractionRequestIds,
                },

            });

            if (response.status !== 200) {
                throw response.data;
            }

            return rok(response.data);
        } catch (error) {
            // Code to handle error
            console.log(error);
            return rerm("Failed to get extraction statuses", { error })
        }
    }


    public async getExtractionResults(requestId: string): Promise<IResp<ExtractionResultApiResponse>> {
        try {
            const response = await this.axiosInstance.get<ExtractionResultApiResponse>(`/extraction/${requestId}/results/text`);

            if (response.status !== 200) {
                return rerm("non 200 status", response.data)
            }

            return rok(response.data);




        } catch (error) {
            console.log(error);
            return rerm("Failed to get extraction results", { error })
        }
    }
}

export default Zuva;


export async function startZuvaExtraction(sb: SupabaseClient<Database>, contractId: string) {


    const zuvaApi = Zuva.getInstance();

    const contract = await sb.from('contract').select("*, zuva_file(*)")
        .eq('id', contractId)
        .gt("zuva_file.expiration", new Date().toISOString())
        .single()

    if (contract.error) {
        throw contract.error
    }

    let file_id
    if (contract.data.zuva_file.length > 0) {
        file_id = contract.data.zuva_file[0].id
    } else {
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


        const zuvaFile = await zuvaApi.uploadFile(stream)

        if (zuvaFile.error) {
            throw new Error('Failed to upload file to Zuva')
        }

        //create zuvafile in sb
        const fileinsert = await sb.from('zuva_file').insert({
            id: zuvaFile.ok.file_id,
            contract_id: contractId,
            expiration: zuvaFile.ok.expiration
        })

        // const file_id = "coff1jtu386c73b1siqg"
        file_id = zuvaFile.ok.file_id
    }

    const extraction = await zuvaApi.createExtraction([file_id])

    if (extraction.error) {
        throw new Error('Failed to create extraction')
    }

    const extractionRequestIds = extraction.ok.file_ids.map(f => f.request_id)


    const insertExtractions = await sb.from('zuva_extraction_job')
        .insert(extraction.ok.file_ids.map(f => ({ request_id: f.request_id, file_id: f.file_id, status: f.status, contract_id: contractId })))

    if (insertExtractions.error) {
        throw insertExtractions.error
    }





}


export async function checkExtractionJobs(sb: SupabaseClient<Database>) {

    const zuvaApi = Zuva.getInstance();


    const extractionJobs = await sb.from('zuva_extraction_job').select()

    if (extractionJobs.error) {
        throw extractionJobs.error
    }

    const extractionStatuses = await zuvaApi.getExtractionStatuses(extractionJobs.data.map((job) => job.request_id))

    if (extractionStatuses.error) {
        throw extractionStatuses.error
    }




    const jobQueue = new PQueue({ concurrency: 20 });
    // const limit = pLimit(10);


    if (extractionStatuses.ok.num_found === 0) {
        return
    }

    Object.values(extractionStatuses.ok.statuses)
        .filter((es) => es.status === ExtractionStatusEnum.complete)
        .map(async (es) => {
            console.log("handling job", es.request_id)
            const extractionResults = await jobQueue.add(() => zuvaApi.getExtractionResults(es.request_id))
            const result = extractionResults as IResp<ExtractionResultApiResponse>
            if (result.error) {
                throw result.error
            }
            // result.ok.results[0].
            const contract_id = extractionJobs.data.find((job) => job.file_id === es.file_id)?.contract_id
            if (!contract_id) {
                throw new Error('Contract id not found')
            }
            const firstLineOfContract = await sb.from('contract_line')
            .select('*')
            .eq('contract_id', contract_id)
            // .eq('page', 1)
            .eq('id', 0)
            
            .single()

            const annotations: Except<Annotation_SB, 'tenant_id' | "id" | "created_at">[] = result.ok.results.flatMap((res) => res.extractions?.map((extraction) => {

                const position = spanToScaledPosition(extraction.spans, firstLineOfContract.data?.page_height ?? 0, firstLineOfContract.data?.page_width ?? 0)

                return {

                    contract_id: contract_id!,
                    text: extraction.text,
                    position: position!,
                    is_user: false,
                    zextractor_id: res.field_id,
                    formatter_item_id: null,
                    formatter_key: null,
                    parslet_id: null,
                    // created_at: new Date().toISOString(),
                    // id: null, 
                    // tenant_id: null,
                }
            }) ?? [])
                .filter((a) => a.position !== null)

            console.log(annotations)

            //@ts-ignore
            const createAnnotation = await sb.from('annotation').insert(annotations)
        })




}