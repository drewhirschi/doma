import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';

import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type Extractor = {
    id: string,
    name: string,
    instruction: string,
    output: {
        schema: string,
        examples?: string[]
    }
}

const systemMessage = `You are a tool used by lawyers for extracting verbatim language containing key information and red flags from our client's contracts in the context of a merger or acquisition. 

Be thorough, the whole document needs to be handled.

Do not provide explanations, just state the verbatim language.

Your output should be a JSON object with a schema that matches the following: {data: {text: string, lines: string}[]} where each object in the array has a verbaitim quote and the lines that quote came from.

In the schema add a string called "lines" that states the start and end of the lines the information came from like "33-48"`



async function execExtractor(extractor: Extractor, contract: string): Promise<ChatCompletionMessage> {
    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemMessage },
        { role: 'user', content: `<contract>${contract}</contract>` },
        {
            role: 'user', content: `<instruction>${extractor.instruction}</instruction>
                <output type="JSON">
                <schema>${extractor.output.schema ?? "{data: {text: string, lines: string}[]}"}</schema>
                ${extractor.output.examples ? `<examples>${extractor.output.examples.map(e => "<example>" + e + "</example>").join('\n')}</examples>` : ''}</output>`
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

export async function reviewContract(supabase: SupabaseClient, contractId: string) {

    const promises: Promise<ChatCompletionMessage>[] = [];
    let contract: string = ""


    const { data: contractData, error: contractError } = await supabase.from('contract').select('*, contract_line(text)').eq('id', contractId).single()

    if (!contractData) {
        console.error('Error loading contract:', contractError);
        return Response.json({ message: "Could not load contract" })
    }


    contractData.contract_line.forEach((line: any, i: number) => {
        contract += `<l id="${i}">${line.text}</l>` + "\n";
    })

    const { data: extractorData, error: extractorError } = await supabase.from('parslet').select('*')
        .order("order", { ascending: true })
        // .limit(1)

    if (!extractorData) {
        console.error('Error loading extractors:', extractorError);
        return Response.json({ message: "Could not load extractors" })
    }

    let extractors = extractorData.map(e => ({ id: e.id, name: e.display_name, instruction: e.instruction, output: { schema: e.schema ?? "", examples: e.examples } }))


    for (const extractor of Object.values(extractors)) {
        promises.push(execExtractor(extractor, contract));
        await new Promise(r => setTimeout(r, 1000))
    }

    const responses = await Promise.all(promises)

    const extractedInfo = responses.flatMap((r, i) => {
        const extractor = extractors[i]
        if (extractor.output.schema) {
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

        if (!ei.ref_lines.includes('-')) return [{
            line_id: Number(ei.ref_lines),
            contract_id: ei.contract_id,
            extracted_info_id: ei.id
        }];

        const refLines = ei.ref_lines.split('-').map(Number)
        const start = refLines[0]
        const end = refLines[1]

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