import { buildXmlContract, execExtractor, saveExtraction } from '@/agents/extractionAgent';
import { generateAgentJsonResponse, getDataFormatted } from '@/agents/formatAgent';

import { Database } from '@/types/supabase';
import { SupabaseClient } from "@supabase/supabase-js";
import { sleep } from '@/utils';

export async function runContractExtraction(supabase: SupabaseClient<Database>, contractId: string, options?: { formatterKeys?: string[] }) {

    console.log(`Running extractors on contract [${contractId}]`)


    const { data: contractData, error: contractError } = await supabase.from('contract')
        .select('*, contract_line(text, ntokens, id), formatted_info(*), project(target)')
        .order("id", { referencedTable: "contract_line", ascending: true })
        .eq('id', contractId).single()

    if (!contractData) {
        console.error('Error loading contract:', contractError);
        return Response.json({ message: "Could not load contract" })
    }





    const extractorFetch = supabase.from('parslet').select('*, formatters(key)')
        .order("order", { ascending: true })
    // .limit(10)

    // if (options?.formatterKeys?.length) {
    //     extractorFetch.eq('formatters.key', options.formatterKeys)
    // }

    let { data: extractors, error: extractorErr } = await extractorFetch

    if (extractorErr) {
        console.error('Error loading extractors:', extractorErr);
        return Response.json({ message: "Could not load extractors" })
    }

    if (options?.formatterKeys?.length) {
        extractors = extractors!.filter(extractor => extractor.formatters.some(f => options.formatterKeys?.includes(f.key)))
    }




    let tokensUsedThisMinute = 0;
    const TOKEN_LIMIT_PER_MINUTE = 400_000;
    const APX_TOKENS_PER_REQUEST = contractData.contract_line.reduce((sum, line) => sum + line.ntokens, 0) + contractData.contract_line.length * 8;

    const rateLimitInterval = setInterval(() => {
        tokensUsedThisMinute = 0;
    }, 60_000);


    await new Promise<void>(async (resolve, reject) => {

        const tasks = []
        while (extractors!.length > 0) {

            if (tokensUsedThisMinute + APX_TOKENS_PER_REQUEST > TOKEN_LIMIT_PER_MINUTE) {
                console.log('Rate limit reached, waiting 15 seconds')
                await sleep(15_000)
                continue
            }

            const extractor = extractors!.shift()

            const task = async () => {
                tokensUsedThisMinute += APX_TOKENS_PER_REQUEST;
                const extractedLines = await execExtractor(supabase, extractor!, contractData)

                if (extractedLines.error) {
                    console.error('Error extracting data:', extractedLines.error);
                    reject()
                } else {

                    // // ask the model to check one more time that the lines are accuarate.

                    // const verificationSystemMessage = `You are a tool used by lawyers for extracting line numbers containing key information and red flags from our client's contracts in the context of a merger or acquisition. 
                    // A set of relevant lines from the contact have already been extracted. Please review the extraction instructions and the extracted lines and return the lines that minimally provide the requested information.

                    // Your output should be a JSON object with a schema that matches the following: { lines: number[]} where each number represents a line number in the contract.
                    
                    // <extraction_instructions>
                    // ${extractor!.instruction}
                    // </extraction_instructions>
                    // `
                    // const input = buildXmlContract(extractedLines?.ok.map((lineNumber: number) => contractData.contract_line[lineNumber]) ?? [])

                    // const verifiedNumbers = await generateAgentJsonResponse<{lines: number[]}>(verificationSystemMessage, input, "gpt-4-turbo")

                    
                    // if (verifiedNumbers.error) {
                    //     console.error('Error verifying extracted data:', verifiedNumbers.error);
                    //     return
                    // }




                    await saveExtraction(supabase, contractId, extractor!, extractedLines.ok)
                }
            }

            tasks.push(task())



        }

        await Promise.all(tasks)

        resolve()
    })

    clearInterval(rateLimitInterval);
    console.log("Extraction finished")



    console.log("formatting extracted data")

    //run formatters
    if (!contractData.target) {
        contractData.target = contractData.project?.target[0] ?? ""
    }

    
    const formatterFetch = supabase.from('formatters')
        .select('*, parslet(*, annotation(*))')
        .eq('parslet.annotation.contract_id', contractId)

    if (options?.formatterKeys?.length) {
        formatterFetch.in('key', options.formatterKeys)
    }

    const { data: formatters, error: formattersError } = await formatterFetch

    if (formattersError) {
        console.error('Error loading formatters:', formattersError);
        return Response.json({ message: "Could not load formatters" })
    }




    formatters.map(async (formatter) => {
        const formatAndSave = async (input: string, itemId: number, annotationIds: string[]) => {
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
            const annIds: string[] = []
            formatter.parslet.map(async (parslet) => {
                input += `<extraction_topic name="${parslet.display_name}">\n`
                input += parslet.annotation.map((annotation, i) => {

                    annIds.push(annotation.id)
                    return `<extraction id="${i}">\n${annotation.text}\n</extraction>\n`
                }).join("\n")
                input += "</extraction_topic>\n"

            })

            await formatAndSave(input, 0, annIds)


        }


    })






}


