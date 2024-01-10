import { ChatCompletion, ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.js';

import { NextRequest } from "next/server";
import OpenAI from 'openai';
import { routeClient } from "@/supabase/ServerClients";

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

In the schema add a string called "Lines" that states the start and end of the lines the information came from like "33-48"`



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

export async function POST(req: NextRequest) {
    console.log(req.url)

    const contract_id = req.url.split('/')[6]
    const supabase = routeClient()
    const promises: Promise<ChatCompletionMessage>[] = [];
    let contract: string = ""


    const { data: contractData, error: contractError } = await supabase.from('contract').select('*, contract_line(text)').eq('id', contract_id).single()

    if (!contractData) {
        console.error('Error loading contract:', contractError);
        return Response.json({ message: "Could not load contract" })
    }


    contractData.contract_line.forEach((line: any, i: number) => {
        contract += `<l id="${i}">${line.text}</l>` + "\n";
    })

    const { data: extractorData, error: extractorError } = await supabase.from('parslet').select('*')

    if (!extractorData) {
        console.error('Error loading extractors:', extractorError);
        return Response.json({ message: "Could not load extractors" })
    }

    const extractors = extractorData.map(e => ({ id: e.id, name: e.display_name, instruction: e.instruction, output: { schema: e.schema ?? "", examples: e.examples } }))

    Object.values(extractors).forEach((extractor) => {
        promises.push(execExtractor(extractor, contract));
    });

    const responses = await Promise.all(promises)

    const responsesMap = responses.flatMap((r, i) => {
        const extractor = extractors[i]
        if (extractor.output.schema) {
            return
        }
        const content = JSON.parse(r.content!)

        return content.data.map((d: any) => {
            return {
                parslet_id: extractor.id,
                data: d.text,
                ref_lines: d.lines,
                contract_id: contract_id
            }
        })
    }).filter(Boolean)

    const { data: insertData, error: insertError } = await supabase
        .from('extracted_information')
        .upsert(responsesMap);

    if (insertError) {
        console.error('Error inserting data:', insertError);
    } else {
        console.log('Data inserted successfully:', insertData);
    }

    return Response.json({ message: "POST request processed" });
}


