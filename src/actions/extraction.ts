import { buildXmlContract, execExtractor, saveExtraction } from '@/agents/extractionAgent';
import { generateAgentJsonResponse, getDataFormatted } from '@/agents/formatAgent';

import { Database } from '@/types/supabase';
import { SupabaseClient } from "@supabase/supabase-js";
import { sleep } from '@/utils';

export async function runContractExtraction(supabase: SupabaseClient<Database>, contractId: string, options?: { formatterKeys?: string[] }): Promise<{ annotations: Annotation_SB[], formattedInfo: FormattedInfo_SB[] }> {

    console.log(`Running extractors on contract [${contractId}]`)


    const { data: contractData, error: contractError } = await supabase.from('contract')
        .select('*, contract_line(text, ntokens, id), formatted_info(*), project(target, id)')
        .order("id", { referencedTable: "contract_line", ascending: true })
        .eq('id', contractId).single()

    if (contractError) {
        console.error('Error loading contract:', contractError);
        throw contractError
    }


    const extractorFetch = supabase.from("project")
        .select("formatters(*, parslet(*))")
        .eq("id", contractData.project_id)
        .single()



    const projectFormatters = await extractorFetch

    if (projectFormatters.error) {
        console.error('Error loading extractors:', projectFormatters.error);
        throw projectFormatters.error
    }

    let extractors = projectFormatters.data.formatters.flatMap(pf => pf.parslet)

    if (options?.formatterKeys?.length) {
        extractors = projectFormatters.data.formatters.filter(pf => options.formatterKeys?.includes(pf.key)).flatMap(pf => pf.parslet)
    }




    // let tokensUsedThisMinute = 0;
    // const TOKEN_LIMIT_PER_MINUTE = 1_000_000;
    // const APX_TOKENS_PER_REQUEST = contractData.contract_line.reduce((sum, line) => sum + line.ntokens, 0) + contractData.contract_line.length * 8;

    // const rateLimitInterval = setInterval(() => {
    //     tokensUsedThisMinute = 0;
    // }, 60_000);


    const newAnnotations = await new Promise<Annotation_SB[]>(async (resolve, reject) => {

        const tasks = []
        while (extractors!.length > 0) {

            // if (tokensUsedThisMinute + APX_TOKENS_PER_REQUEST > TOKEN_LIMIT_PER_MINUTE) {
            //     console.log('Rate limit reached, waiting 15 seconds')
            //     await sleep(15_000)
            //     continue
            // }

            const extractor = extractors!.shift()

            const task = async () => {
                // tokensUsedThisMinute += APX_TOKENS_PER_REQUEST;
                const extractedLines = await execExtractor(supabase, extractor!, contractData)

                if (extractedLines.error) {
                    console.error(`Failed extracting [${extractor?.key}] on [${contractData.id}][${contractData.display_name}]`, extractedLines.error);
                    //TODO: create a db record of the failed extraction
                } else {

                    const newAnnotations = await saveExtraction(supabase, contractId, extractor!, extractedLines.ok)
                    return newAnnotations
                }
            }

            tasks.push(task())



        }


        const results = await Promise.all(tasks)
        //@ts-ignore
        resolve(results.flat().filter(Boolean))
    })

    // clearInterval(rateLimitInterval);
    console.log(`Extraction finished for [${contractData.id}][${contractData.display_name}]`)



    console.log(`Formatting data extracted from [${contractData.id}][${contractData.display_name}]`)

    //run formatters
    if (!contractData.target) {
        contractData.target = contractData.project?.target[0] ?? ""
    }




    const formatterFetch = supabase.from('formatters')
        .select('*, parslet(*, annotation(*))')
        .eq('parslet.annotation.contract_id', contractId)
        .in('key', projectFormatters.data.formatters.map(f => f.key))

    if (options?.formatterKeys?.length) {
        formatterFetch.in('key', options.formatterKeys)
    }

    const { data: formatters, error: formattersError } = await formatterFetch

    if (formattersError) {
        console.error('Error loading formatters:', formattersError);
        throw formattersError
    }



    const fiProms: Promise<FormattedInfo_SB | null>[] = []


    formatters.forEach(async (formatter) => {
        const formatAndSave = async (input: string, itemId: number, annotationIds: string[]): Promise<FormattedInfo_SB | null> => {
            const res = await getDataFormatted(formatter, contractData, input, true)

            if (res.error) {
                console.error('Error formatting data:', res.error);
                return null
            }

            console.log(formatter.key)

            const newFormattedInfo = {
                data: res.ok[0],
                id: itemId,
                formatter_key: formatter.key,
                contract_id: contractId
            }

            const upsertRes = await supabase.from("formatted_info").upsert(newFormattedInfo).select()

            if (upsertRes.error) {
                console.error('Error saving formatted data:', formatter.key, upsertRes.error);
                return null
            }

            const annotationUpdate = await supabase.from("annotation")
                .update({ formatter_key: formatter.key, formatter_item_id: itemId }).in("id", annotationIds)

            return upsertRes.data[0]
        }



        if (formatter.hitems) {

            formatter.parslet.forEach(async (parslet) => {
                return parslet.annotation.forEach(async (annotation, i) => {
                    let input = `<extraction>\n${annotation.text}\n</extraction>`

                    fiProms.push(formatAndSave(input, i, [annotation.id]))
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

            fiProms.push(formatAndSave(input, 0, annIds))


        }




    })




    // @ts-ignore
    const formatResults: FormattedInfo_SB[] = (await Promise.all(fiProms)).filter(Boolean)


    return { annotations: newAnnotations, formattedInfo: formatResults }

}


async function verifier() {

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
}


