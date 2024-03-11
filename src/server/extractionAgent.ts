import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';
import { IResp, rerm, rok } from '@/utils';

import { Database } from '@/types/supabase';
import { ExtractJobStatus } from '@/types/enums';
import OpenAI from 'openai';
import PQueue from 'p-queue';
import { SupabaseClient } from '@supabase/supabase-js';
import { sleep } from '@/utils';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



const systemMessage = `You are a tool used by lawyers for extracting verbatim language containing key information and red flags from our client's contracts in the context of a merger or acquisition. 

Be thorough, the whole document needs to be handled.

Do not provide explanations, just state the verbatim language.

Your output should be a JSON object with a schema that matches the following: {data: {text: string, lines: string}[]} where each object in the array has a verbaitim quote and the lines that quote came from.

In the schema, the property "lines" should state the start and end of the lines the information came from like "33-48"`






export type RawExtractionData = { text: string, lines: string, id: string }


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
        .select('*, contract_line(text, ntokens)')
        .order("id", { referencedTable: "contract_line", ascending: true })
        .eq('id', contractId).single()

    if (!contractData) {
        console.error('Error loading contract:', contractError);
        return Response.json({ message: "Could not load contract" })
    }



    const { data: extractors, error: extractorError } = await supabase.from('parslet').select('*')
        .order("order", { ascending: true })
        .is('schema', null)

    if (!extractors) {
        console.error('Error loading extractors:', extractorError);
        return Response.json({ message: "Could not load extractors" })
    }



    let tokensUsedThisMinute = 0;
    const TOKEN_LIMIT_PER_MINUTE = 250_000;
    const APX_TOKENS_PER_REQUEST = contractData.contract_line.reduce((sum, line) => sum + line.ntokens, 0) + contractData.contract_line.length * 8;

    const rateLimitInterval = setInterval(() => {
        tokensUsedThisMinute = 0;
    }, 60_000);


    while (extractors.length > 0) {

        if (tokensUsedThisMinute + APX_TOKENS_PER_REQUEST > TOKEN_LIMIT_PER_MINUTE) {
            console.log('Rate limit reached, waiting 15 seconds')
            await sleep(15_000)
            continue
        }

        const extractor = extractors.shift()

        const task = async () => {
            tokensUsedThisMinute += APX_TOKENS_PER_REQUEST;
            const extraction = await execExtractor(supabase, extractor!, contractData)

            if (extraction.error) {
                console.error('Error extracting data:', extraction.error);
            } else {
                await saveExtraction(supabase, contractId, extractor!, extraction.ok)
            }
        }

        task()



    }


    clearInterval(rateLimitInterval);



}




export async function execExtractor(sb: SupabaseClient<Database>, extractor: Parslet_SB, contract: Contract_SB & { contract_line: { text: string, ntokens: number }[] }): Promise<IResp<RawExtractionData[]>> {

    const job = await createExtractionJob(sb, contract.id, extractor!.id)

    await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.RUNNING)
    console.log(`executing extractor ${extractor.display_name}`)


    const xmlContractText = buildXmlContract(contract.contract_line)

    try {

        const res: ChatCompletion = await openai.chat.completions.create({
            messages: buildExtracitonMessages(extractor, xmlContractText),
            model: 'gpt-4-1106-preview',
            temperature: 0,
            response_format: { 'type': "json_object" }
        });

        const responseMessage = res.choices[0].message;

        let content: { data: RawExtractionData[] } = { data: [] }
        try {
            content.data = JSON.parse(responseMessage.content!).data.map((d: { text: string, lines: string }) => ({ ...d, id: uuidv4() }))
        } catch (error) {
            console.error("Failed to parse: ", responseMessage.content)
            throw error
        }

        await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.COMPLETE)
        return rok(content.data)

    } catch (error) {
        console.error('Error extracting data:', error);
        await setJobStatus(sb, contract.id, extractor.id, ExtractJobStatus.FAILED)
        return rerm("Error extracting data", { error })
    }




}


async function saveExtraction(supabase: SupabaseClient<Database>, contractId: string, extractor: Parslet_SB, extractionData: RawExtractionData[]) {
    const { error: insertError } = await supabase
        .from('extracted_information')
        .insert(extractionData.map((d) => (
            {
                id: d.id,
                parslet_id: extractor.id,
                data: d.text,
                contract_id: contractId
            }
        )));

    if (insertError) {
        console.error('Error inserting data:', insertError);
        return
    } else {
        console.log(`Inserted ${extractionData.length} ${extractor.display_name} extractions successfully`);
    }



    const eiRefs = extractionData.flatMap((ei) => {

        const { start, end } = parseRefLines(ei.lines)

        const refs = []
        for (let i = start; i <= end; i++) {
            refs.push({
                line_id: i,
                contract_id: contractId,
                extracted_info_id: ei.id
            })
        }
        return refs
    })

    const { error: insertRelaitonshipError } = await supabase
        .from('line_ref')
        .insert(eiRefs);


    if (insertRelaitonshipError) {
        console.error('Error inserting data:', insertRelaitonshipError);
    } else {
        console.log(`Inserted ${eiRefs.length} line references`);
    }

}

/**
 * @param {string} xmlContractText - The line XML of the contract.
 */
function buildExtracitonMessages(extractor: Parslet_SB, xmlContractText: string) {
    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemMessage },
        { role: 'user', content: `<contract>${xmlContractText}</contract>` },
        {
            role: 'user', content: `<instruction>${extractor.instruction}</instruction>
                <output type="JSON">
                <schema>${extractor.schema ?? "{data: {text: string, lines: string}[]}"}</schema>
                ${extractor.examples ? `<examples>${extractor.examples.map(e => "<example>" + e + "</example>").join('\n')}</examples>` : ''}</output>`
        }
    ];
    return messages;
}

export function buildXmlContract(contractLines: { text: string }[]) {
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
        status: "pending",
        updated_at: new Date().toISOString()
    }).select().single()

    if (job.error) {
        console.error('Error creating job:', job.error);
        return
    }

    return job.data

}