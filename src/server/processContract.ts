import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';

import { Database } from '@/types/supabase';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



const systemMessage = `You are a tool used by lawyers for extracting verbatim language containing key information and red flags from our client's contracts in the context of a merger or acquisition. 

Be thorough, the whole document needs to be handled.

Do not provide explanations, just state the verbatim language.

Your output should be a JSON object with a schema that matches the following: {data: {text: string, lines: string}[]} where each object in the array has a verbaitim quote and the lines that quote came from.

In the schema add a string called "lines" that states the start and end of the lines the information came from like "33-48"`


/**
 * Executes an extractor on a contract and returns the chat completion message.
 * @param {Extractor} extractor - The extractor object containing the id, name, instruction, and output schema.
 * @param {string} contract - The line XML of the contract.
 * @returns {Promise<ChatCompletionMessage>} The chat completion message.
 */
export async function execExtractor(extractor: Parslet_SB, contract: string): Promise<ChatCompletionMessage> {
    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemMessage },
        { role: 'user', content: `<contract>${contract}</contract>` },
        {
            role: 'user', content: `<instruction>${extractor.instruction}</instruction>
                <output type="JSON">
                <schema>${extractor.schema ?? "{data: {text: string, lines: string}[]}"}</schema>
                ${extractor.examples ? `<examples>${extractor.examples.map(e => "<example>" + e + "</example>").join('\n')}</examples>` : ''}</output>`
        }
    ];

    const res: ChatCompletion = await openai.chat.completions.create({
        messages,
        model: 'gpt-4-1106-preview',
        temperature: 0,
        response_format: { 'type': "json_object" }
    });

    return res.choices[0].message;
}

export function xmlLinesContract(contractLines: { text: string }[]) {
    return contractLines.reduce((acc, line, i) => {
        return acc + `<l id="${i}">${line.text}</l>` + "\n";
    }, "")
}

export async function reviewContract(supabase: SupabaseClient<Database>, contractId: string) {

    const promises: Promise<ChatCompletionMessage>[] = [];


    const { data: contractData, error: contractError } = await supabase.from('contract').select('*, contract_line(text)').order("id", { referencedTable: "contract_line", ascending: true }).eq('id', contractId).single()

    if (!contractData) {
        console.error('Error loading contract:', contractError);
        return Response.json({ message: "Could not load contract" })
    }


    const xmlContract = xmlLinesContract(contractData.contract_line)

    const { data: extractors, error: extractorError } = await supabase.from('parslet').select('*')
        .order("order", { ascending: true })
    // .limit(1)

    if (!extractors) {
        console.error('Error loading extractors:', extractorError);
        return Response.json({ message: "Could not load extractors" })
    }



    for (const extractor of Object.values(extractors)) {
        promises.push(execExtractor(extractor, xmlContract));
        await new Promise(r => setTimeout(r, 1000))
    }

    const responses = await Promise.all(promises)

    const extractedInfo = responses.flatMap((r, i) => {
        const extractor = extractors[i]
        if (extractor.schema) {
            return
        }
        const content = JSON.parse(r.content!)

        return content.data.map((d: any) => {
            return {
                id: uuidv4(),
                parslet_id: extractor.id,
                data: d.text,
                ref_lines: d.lines,
                contract_id: contractId
            }
        })
    }).filter(Boolean)



    const { data: insertData, error: insertError } = await supabase
        .from('extracted_information')

        .insert(extractedInfo.map(({ id, parslet_id, data, contract_id }) => ({
            id,
            parslet_id,
            data,
            contract_id
        })));




    if (insertError) {
        console.error('Error inserting data:', insertError);
    } else {
        console.log('Data inserted successfully:', insertData);
    }

    const eiRefs = extractedInfo.flatMap((ei) => {


        const { start, end } = parseRefLines(ei.ref_lines)

        const refs = []
        for (let i = start; i <= end; i++) {
            refs.push({
                line_id: i,
                contract_id: ei.contract_id,
                extracted_info_id: ei.id
            })
        }
        return refs
    })

    const { data: insertRelationships, error: insertRelaitonshipError } = await supabase
        .from('line_ref')
        .insert(eiRefs);




    if (insertRelaitonshipError) {
        console.error('Error inserting data:', insertRelaitonshipError);
    } else {
        console.log('Data inserted successfully:', insertData);
    }

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

