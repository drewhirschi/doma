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


const mindsdbLLM = new OpenAI({
    apiKey: process.env.MINDSDB_API_KEY,
    baseURL: "https://llm.mdb.ai"
});

const togetherLLM = new OpenAI({
    apiKey: process.env.TOGETHERAI_API_KEY,
    baseURL: "https://api.together.xyz/v1",
    // defaultQuery: {}
});


interface ContractLine {
    text: string;
    ntokens: number;
    id: number;
}




const RawExtractionDataSchema = z.object({
    lines: z.number().array(),
});

export type RawExtractionData = z.infer<typeof RawExtractionDataSchema>;





export async function runSingleExtraction(supabase: SupabaseClient<Database>, contractId: string, extractorId: string) {

    const [extractorq, contractq] = await Promise.all([
        supabase.from('parslet').select('*').eq('id', extractorId).single(),
        supabase.from('contract').select('*, contract_line(text, ntokens, id)').eq('id', contractId).single()
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








export async function execExtractor(sb: SupabaseClient<Database>, extractor: Parslet_SB, contract: Contract_SB & { contract_line: ContractLine[] }): Promise<IResp<string[]>> {

    // const job = await createExtractionJob(sb, contract.id, extractor!.id)

    await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.RUNNING)
    console.log(`executing extractor ${extractor.display_name}`)


    const contractSegments = segmentContractLines(contract.contract_line, 120_000)

    const relevantHighlights: string[] = []

    try {
        for (let contractSegment of contractSegments) {

            const xmlContractText = buildXmlContract(contractSegment)


            const res: ChatCompletion = await openai.chat.completions.create({
                messages: buildExtracitonMessages(extractor, xmlContractText),
                model: 'gpt-4-turbo',
                // model: 'gpt-3.5-turbo',
                temperature: 0,
                response_format: { 'type': "json_object" }
            });

           

            // const res: ChatCompletion = await mindsdbLLM.chat.completions.create({
            //     messages: buildExtracitonMessages(extractor, xmlContractText),
            //     // model: 'llama-3-70b',
            //     model: 'mixtral-8x7b',
            //     // model: 'gpt-3.5-turbo',
            //     temperature: 0,
            //     response_format: { 'type': "json_object" }
            // });

            const responseMessage = res.choices[0].message;

            try {
                const res: { lines: string[] } = JSON.parse(responseMessage.content!)
                relevantHighlights.push(...res.lines)

            } catch (error) {
                console.error("Failed to parse: ", responseMessage.content)
                // await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.FAILED)
                return rerm("Failed to parse response", { error })
            }

        }

        // await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.COMPLETE)
        return rok(relevantHighlights)

    } catch (error) {
        console.error('Error extracting data:', error);
        // await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.FAILED)
        return rerm("Error extracting data", { error })
    }




}


export async function saveExtraction(supabase: SupabaseClient<Database>, contractId: string, extractor: Parslet_SB, extractedLines: string[]) {

    if (extractedLines.length === 0) {
        console.log(`No lines extracted for ${extractor.display_name}`)
        return
    }



    const groupedLines: number[][] = extractedLines.map((highlight) => {
        const { start, end } = parseRefLines(highlight)

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })



    const lineRefs = groupedLines.flatMap((lineNumbers) => {

        return lineNumbers.map((lineNumber) => {

            return {
                line_id: lineNumber,
                contract_id: contractId,
                extractor_key: extractor.key
            }
        })
    })

    const { error: insertRelaitonshipError } = await supabase
        .from('line_ref')
        .insert(lineRefs);


    if (insertRelaitonshipError) {
        console.error('Error inserting data:', insertRelaitonshipError);
    } else {
        console.log(`Inserted ${lineRefs.length} line references`);
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

    const { data: insertedAnnotations, error: insertError } = await supabase
        .from('annotation')
        // @ts-ignore
        .insert(annotations).select();

    if (insertError) {
        console.error('Error inserting data:', insertError);
        return
    } else {
        console.log(`Inserted ${annotations.length} ${extractor.display_name} extractions successfully`);
        return insertedAnnotations
    }

}

/**
 * @param {string} xmlContractText - The line XML of the contract.
 */
function buildExtracitonMessages(extractor: Parslet_SB, xmlContractText: string) {

    const systemMessage = `You are a tool used by lawyers for highlighting lines that contain key information and red flags from our client's contracts in the context of a merger or acquisition. 
    Be thorough, the whole document needs to be considered.
    When selecting an entire section, with subsections for example, include the blank lines inbetween the subsections as well.
    When selecting a title and paragraph, include blank lines inbwteen them.

Your output should be a JSON object with a schema that matches the following: { lines: string[]} where each entry in the lines array represents a highlight in the contract that is relevant to the extraction instructions.
The highlight string should be formatted {startLineNumber}-{endLineNumber}

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
    return contractLines.reduce((acc, line) => {
        return acc + `<line id="${line.id}">${line.text}</line>` + "\n";
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

function segmentContractLines(lines: ContractLine[], tokensPerSegment = 120_000): ContractLine[][] {
    const segments: ContractLine[][] = [];
    let currentSegment: ContractLine[] = [];
    let currentTokenCount = 0;

    lines.forEach((line) => {
        if (currentTokenCount + line.ntokens > tokensPerSegment) {
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
