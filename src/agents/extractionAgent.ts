import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';
import { IResp, rerm, rok } from '@/utils';

import { Database } from '@/types/supabase';
import { Except } from 'type-fest';
import { ExtractJobStatus } from '@/types/enums';
import { IpOwnershipType } from '@/types/formattersTypes';
import { Json } from '@/types/supabase-generated';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { buildScaledPostionFromContractLines } from '@/helpers';
import { getDataFormatted } from './formatAgent';
import { sleep } from '@/utils';
import { z } from "zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


interface ContractLine {
    text: string;
    ntokens: number;
}




const RawExtractionDataSchema = z.object({
    lines: z.number().array(),
});

export type RawExtractionData = z.infer<typeof RawExtractionDataSchema>;

const extractorIdMap = {
    paymentTerms: "8e105eac-82f9-473f-9330-f837b173bfa8",
    IpOwnership: "084fc678-f4c0-4e54-9524-0597a3330316",
    license: "334e16da-2c83-4110-8ed1-92ff35fb5b55"

}



export async function runSingleExtraction(supabase: SupabaseClient<Database>, contractId: string, extractorId: string) {

    const [extractorq, contractq] = await Promise.all([
        supabase.from('parslet').select('*').eq('id', extractorId).single(),
        supabase.from('contract').select('*, contract_line(text, ntokens)').eq('id', contractId).single()
    ])

    if (extractorq.error) {
        console.error('Error loading extractor', extractorq.error);
        throw extractorq.error

    }

    if (contractq.error) {
        console.error('Error loading contract', contractq.error);
        throw contractq.error
    }

    console.log(`Running extractor ${extractorq.data.display_name} on contract [${contractId}]`)

    const extraction = await execExtractor(supabase, extractorq.data, contractq.data)

    if (extraction.error) {
        console.error('Error extracting data:', extraction.error);
    } else {
        await saveExtraction(supabase, contractId, extractorq.data, extraction.ok)
    }

}



export async function runContractExtraction(supabase: SupabaseClient<Database>, contractId: string) {

    console.log(`Running extractors on contract [${contractId}]`)


    const { data: contractData, error: contractError } = await supabase.from('contract')
        .select('*, contract_line(text, ntokens), formatted_info(*), project(target)')
        .order("id", { referencedTable: "contract_line", ascending: true })
        .eq('id', contractId).single()

    if (!contractData) {
        console.error('Error loading contract:', contractError);
        return Response.json({ message: "Could not load contract" })
    }



    // const { data: extractors, error: extractorError } = await supabase.from('parslet').select('*')
    //     .order("order", { ascending: true })
    // // .limit(10)

    // if (extractorError) {
    //     console.error('Error loading extractors:', extractorError);
    //     return Response.json({ message: "Could not load extractors" })
    // }



    // let tokensUsedThisMinute = 0;
    // const TOKEN_LIMIT_PER_MINUTE = 250_000;
    // const APX_TOKENS_PER_REQUEST = contractData.contract_line.reduce((sum, line) => sum + line.ntokens, 0) + contractData.contract_line.length * 8;

    // const rateLimitInterval = setInterval(() => {
    //     tokensUsedThisMinute = 0;
    // }, 60_000);


    // while (extractors.length > 0) {

    //     if (tokensUsedThisMinute + APX_TOKENS_PER_REQUEST > TOKEN_LIMIT_PER_MINUTE) {
    //         console.log('Rate limit reached, waiting 15 seconds')
    //         await sleep(15_000)
    //         continue
    //     }

    //     const extractor = extractors.shift()

    //     const task = async () => {
    //         tokensUsedThisMinute += APX_TOKENS_PER_REQUEST;
    //         const extractedLines = await execExtractor(supabase, extractor!, contractData)

    //         if (extractedLines.error) {
    //             console.error('Error extracting data:', extractedLines.error);
    //         } else {
    //             await saveExtraction(supabase, contractId, extractor!, extractedLines.ok)
    //         }
    //     }

    //     task()



    // }


    // clearInterval(rateLimitInterval);

    console.log("formatting extracted data")

    //run formatters
    if (!contractData.target) {
        contractData.target = contractData.project?.target[0] ?? ""
    }

    const { data: formatters, error: formattersError } = await supabase.from('formatters')
        .select('*, parslet(*, annotation(*))')
        .eq('parslet.annotation.contract_id', contractId)

    if (formattersError) {
        console.error('Error loading formatters:', formattersError);
        return Response.json({ message: "Could not load formatters" })
    }




    formatters.map(async (formatter) => {
        const formatAndSave = async (input: string, itemId: number, annotationIds:string[]) => {
            const res = await getDataFormatted(formatter, contractData, input, true)

            if (res.error) {
                console.error('Error formatting data:', res.error);
                return
            }

            console.log(formatter.key)
            const upsertRes = await supabase.from("formatted_info").upsert({ 
                data: res.ok[0], 
                id: itemId,
                formatter_key: formatter.key,
                contract_id: contractId
            })

            if (upsertRes.error) {
                console.error('Error saving formatted data:', formatter.key, upsertRes.error);
            }

            const annotationUpdate = await supabase.from("annotation")
            .update({ formatter_key: formatter.key, formatter_item_id: itemId }).in("id", annotationIds)
        }



        if (formatter.hitems) {

            formatter.parslet.map(async (parslet) => {
                parslet.annotation.map(async (annotation, i) => {
                    let input = `<extraction>\n${annotation.text}\n</extraction>`

                    await formatAndSave(input, i, [annotation.id])
                })

            })
        } else {
            let input = ""
            const annIds:string[] = []
            formatter.parslet.map(async (parslet) => {
                input += `<extraction_topic name="${parslet.display_name}">\n`
                input += parslet.annotation.map((annotation, i) =>{

                    annIds.push(annotation.id)
                   return  `<extraction id="${i}">\n${annotation.text}\n</extraction>\n`
                }).join("\n")
                input += "</extraction_topic>\n"

            })

            await formatAndSave(input, 0, annIds)


        }


    })






}




export async function execExtractor(sb: SupabaseClient<Database>, extractor: Parslet_SB, contract: Contract_SB & { contract_line: ContractLine[] }): Promise<IResp<number[]>> {

    const job = await createExtractionJob(sb, contract.id, extractor!.id)

    await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.RUNNING)
    console.log(`executing extractor ${extractor.display_name}`)


    const contractSegments = segmentContractLines(contract.contract_line)

    const relevantLineNubers: number[] = []

    try {
        for (let contractSegment of contractSegments) {

            const xmlContractText = buildXmlContract(contractSegment)


            const res: ChatCompletion = await openai.chat.completions.create({
                messages: buildExtracitonMessages(extractor, xmlContractText),
                model: 'gpt-4-turbo',
                temperature: 0,
                response_format: { 'type': "json_object" }
            });

            const responseMessage = res.choices[0].message;

            try {
                const res: { lines: number[] } = JSON.parse(responseMessage.content!)
                relevantLineNubers.push(...res.lines)

            } catch (error) {
                console.error("Failed to parse: ", responseMessage.content)
                await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.FAILED)
                throw error
            }

        }

        await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.COMPLETE)
        return rok(relevantLineNubers)

    } catch (error) {
        console.error('Error extracting data:', error);
        await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.FAILED)
        return rerm("Error extracting data", { error })
    }




}


async function saveExtraction(supabase: SupabaseClient<Database>, contractId: string, extractor: Parslet_SB, extractedLines: number[]) {

    if (extractedLines.length === 0) {
        console.log(`No lines extracted for ${extractor.display_name}`)
        return
    }

    const lineRefs = extractedLines.map((lineNumber) => {


        return {
            line_id: lineNumber,
            contract_id: contractId,
            extractor_key: extractor.key
        }
    })

    const { error: insertRelaitonshipError } = await supabase
        .from('line_ref')
        .insert(lineRefs);


    if (insertRelaitonshipError) {
        console.error('Error inserting data:', insertRelaitonshipError);
    } else {
        console.log(`Inserted ${lineRefs.length} line references`);
    }



    const groupedLines: number[][] = [];
    let currentGroup: number[] = [];

    extractedLines.forEach((lineNumber, index) => {
        if (index === 0 || lineNumber === extractedLines[index - 1] + 1) {
            currentGroup.push(lineNumber);
        } else {
            groupedLines.push(currentGroup);
            currentGroup = [lineNumber];
        }
    });

    // Add the last group if not empty
    if (currentGroup.length) {
        groupedLines.push(currentGroup);
    }

    const { data: contractLines, error: linesError } = await supabase.from('contract_line').select().eq('contract_id', contractId).order('id', { ascending: true })
    if (linesError) {
        console.error('Error loading contract lines:', linesError);
        return
    }

    const annotations: Except<Annotation_SB, 'tenant_id' | "id" | "created_at">[] = groupedLines.map((group) => {

        const lines = contractLines.filter((l) => group.includes(l.id))
        const position = buildScaledPostionFromContractLines(lines)

        return {

            contract_id: contractId,
            text: lines.map((l) => l.text).join("\n"),
            position: position,
            is_user: false,
            zextractor_id: null,
            formatter_item_id: null,
            formatter_key: null,
            parslet_id: extractor.id,
            // created_at: new Date().toISOString(),
            // id: null, 
            // tenant_id: null,
        }
    })

    const { error: insertError } = await supabase
        .from('annotation')
        // @ts-ignore
        .insert(annotations);

    if (insertError) {
        console.error('Error inserting data:', insertError);
        return
    } else {
        console.log(`Inserted ${annotations.length} ${extractor.display_name} extractions successfully`);
    }

}

/**
 * @param {string} xmlContractText - The line XML of the contract.
 */
function buildExtracitonMessages(extractor: Parslet_SB, xmlContractText: string) {

    const systemMessage = `You are a tool used by lawyers for extracting line numbers containing key information and red flags from our client's contracts in the context of a merger or acquisition. Be thorough, the whole document needs to be handled.

Your output should be a JSON object with a schema that matches the following: { lines: number[]} where each number represents a line number in the contract that is relevant to the extraction instructions.

<extraction_instructions>
${extractor.instruction}
</extraction_instructions>
`

    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemMessage },
        { role: 'user', content: `<contract>${xmlContractText}</contract>` },
    ];
    return messages;
}

export function buildXmlContract(contractLines: ContractLine[]) {
    return contractLines.reduce((acc, line, i) => {
        return acc + `<line id="${i}">${line.text}</line>` + "\n";
    }, "")
}

export function parseRefLines(refLines: string) {
    if (!refLines.includes('-')) return {
        start: Number(refLines),
        end: Number(refLines)
    };

    const lines = refLines.split('-').map(Number)
    const start = lines[0]
    const end = lines[1]

    return { start, end }
}


async function setJobStatus(supabase: SupabaseClient<Database>, contractId: string, extractorId: string, status: ExtractJobStatus) {
    const { error } = await supabase.from('extract_jobs').update({ status, updated_at: new Date().toISOString() }).eq('contract_id', contractId).eq('parslet_id', extractorId)
    if (error) {
        console.error('Error updating job status:', error);
    }
}

async function createExtractionJob(supabase: SupabaseClient<Database>, contractId: string, extractorId: string): Promise<ExtractJob_SB | undefined> {

    const job = await supabase.from("extract_jobs").upsert({
        contract_id: contractId,
        parslet_id: extractorId,
        status: ExtractJobStatus.PENDING,
        updated_at: new Date().toISOString()
    }).select().single()

    if (job.error) {
        console.error('Error creating job:', job.error);
        return
    }

    return job.data

}

function segmentContractLines(lines: ContractLine[]): ContractLine[][] {
    const segments: ContractLine[][] = [];
    let currentSegment: ContractLine[] = [];
    let currentTokenCount = 0;

    lines.forEach((line) => {
        if (currentTokenCount + line.ntokens > 10000) {
            segments.push(currentSegment);
            currentSegment = currentSegment.slice(-5);
            currentTokenCount = currentSegment.reduce((sum, item) => sum + item.ntokens, 0);
        }
        currentSegment.push(line);
        currentTokenCount += line.ntokens;
    });

    // Add the last segment if not empty
    if (currentSegment.length) {
        segments.push(currentSegment);
    }

    return segments;
}
