import { IResp, rerm, rok } from './utils';
import axios, { AxiosInstance } from 'axios';

import { Readable } from 'stream';
import { RealtimeChannel } from '@supabase/supabase-js';
import fs from 'fs';

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

type CreateExtractionResult = {
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

type ExtractionStatusesResponse = {
    errors: {
        [key: string]: { error: ErrorDetail }
    };
    num_errors: number;
    num_found: number;
    statuses: {
        [key: string]: StatusDetail
    };
};




class Zuva {
    private static instance: Zuva;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: 'https://us.app.zuva.ai/api/v2',
            timeout: 5000,
            headers: {
                // 'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ZUVA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
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


    public async uploadFile(fileStream: Readable) {
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
            return response.data;


        } catch (error) {
            // Code to handle error
            console.log(error);
        }

    }

    public async createExtraction(fileIds: string[]): Promise<IResp<CreateExtractionResult>> {

        try {

            const res: CreateExtractionResult = {
                file_ids: []
            }

            for (let i = 0; i < fileIds.length; i += 10) {

                const upperLimit = Math.min(i + 10, Object.values(this.fields).length)

                const response = await this.axiosInstance.post<CreateExtractionResult>('/extraction', {
                    file_ids: fileIds,
                    field_ids: Object.values(this.fields).slice(i, upperLimit),
                });

                if (response.status !== 201) {
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



    public async getExtractionStatuses(extractionRequestIds: string[]): Promise<IResp<ExtractionStatusesResponse>> {
        try {
            const response = await this.axiosInstance.get<ExtractionStatusesResponse>(`/extractions`, {
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
}

export default Zuva;