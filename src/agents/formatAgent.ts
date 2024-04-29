import { Database, Json } from "@/types/supabase-generated";
import { IResp, ISuccessResp, isEmptyObject, objectToXml, rerm, rok } from "@/utils";
import { ZodObject, ZodTypeAny } from "zod";
import { hasItemsChild, zodObjectToXML } from "@/zodUtils";

import { ContractWithFormattedInfo } from "@/types/complex";
import { FormatterKeys } from "@/types/enums";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { buildListShape } from "@/types/formattersTypes";
import { getFormatterShape } from "@/shared/getFormatterShape";
import { serverActionClient } from "@/supabase/ServerClients";
import { z } from "zod"

interface IFormatter<T> {
    instruction: string;
    responseShape: ZodObject<any>
    key: string;
    run: (oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string) => Promise<IResp<T | null>>
}



export async function pipelineRunFormatter(sb: SupabaseClient<Database>, formatter_key: string, contractId: string, targetEntityName: string): Promise<IResp<any | null>> {





    const formatterq = await sb.from("formatters")
        .select("*, parslet(id)")
        .eq("key", formatter_key).single()

    if (formatterq.error) {
        return rerm("Formatter not found", { formatter_key })
    }

    const eiq = await sb.from("annotation")
        .select("*, contract_line(*)")
        .eq("contract_id", contractId)
        .or(`formatter_key.eq.${formatter_key}, parslet_id.in.(${formatterq.data?.parslet.map((p) => p.id).join()})`)


    if (eiq.error) {
        return rerm("Error fetching related extractions.", eiq.error)
    }

    //if there isn't any extracted info there is nothing to format.
    if (eiq.data.length === 0) {
        console.log(`Skipping ${formatter_key} formatter, there are no related extractions.`)
        return rok(null)
    }

    // ${ei.contract_line.map((cl) => `<line id=${cl.id}>${cl.text}</line>`).join("\n")}
    let input = `<contract_extractions topic=${formatter_key}>
${eiq.data.map((ei) => `<extraction id=${ei.id}>
${ei.text}
</extraction>`).join("\n")}
</contract_extractions>`

    // console.log('extracted info', input)
    // console.log(getSystemMessage("Target Entity", this.instruction))
    // console.log(input)






    return rok({})
}

export async function formatPipeline(sb: SupabaseClient<Database>, contractId: string, targetEntityName: string) {

    const results = []
    for (const formatter_key in FormatterKeys) {
        const res = await pipelineRunFormatter(sb, formatter_key, contractId, targetEntityName)
        if (res.error) {
            console.error(`There was an error running formatter [${formatter_key}] on contract [${contractId}]`, res.error)
        } else {
            results.push(res.ok)
        }
    }


    return results
}

export async function generateAgentJsonResponse(sysMessage: string, input: string, model = "gpt-4-turbo"): Promise<IResp<any>> {
    const oaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const res = await oaiClient.chat.completions.create({
            messages: [{
                role: 'system',
                content: sysMessage
            },
            {
                role: "user",
                content: input
            }],
            model,
            temperature: 0,
            response_format: { 'type': "json_object" }
        });

        if (!res.choices[0].message.content) {
            return rerm("No formatter message content", {})
        }
        const json = JSON.parse(res.choices[0].message.content);

        return rok(json);
    } catch (error) {
        return rerm("Error generating agent response", { error })
    }

}





export async function buildInstruction(formatter: Formatter_SB, contract: ContractWithFormattedInfo, singleMode: boolean): Promise<string> {

    const agreementInfo = contract.formatted_info.find((fi) => fi.formatter_key === FormatterKeys.agreementInfo)

    const agreementInfoStr = (!!agreementInfo && !isEmptyObject(agreementInfo.data))
        ? objectToXml(agreementInfo.data, "agreementInfo")
        : `The Target Entity is "${contract.target}". Counterparty is any party that is not a Target Entity.`

    const schema = (singleMode || formatter.hitems)
        ? getFormatterShape(formatter.key)
        : buildListShape(getFormatterShape(formatter.key))


    let inst = `You are a meticulous M&A lawyer tasked with condensing and formatting key contract information pulled from the Target Entity's contracts.

        ${agreementInfoStr}
       
        
        Do not provide explanations, just respond with JSON according to the schema. When a field is nullable, you must respond with the type or null.
        
        ${zodObjectToXML(schema)}`

    let additionalInstructions = ""

    switch (formatter.key) {

        case FormatterKeys.term:
            additionalInstructions += `Todays date is ${new Date().toISOString()}`;

        // case FormatterKeys.trojans:

        //     additionalInstructions += `
        // ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === FormatterKeys.license)?.data, FormatterKeys.license)}
        // ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === FormatterKeys.mostFavoredNation)?.data, FormatterKeys.mostFavoredNation)}
        // ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === FormatterKeys.nonCompete)?.data, FormatterKeys.nonCompete)}
        // ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === FormatterKeys.convenantNotToSue)?.data, FormatterKeys.convenantNotToSue)}
        // ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === FormatterKeys.nonSolicitHire)?.data, FormatterKeys.nonSolicitHire)}
        // ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === FormatterKeys.rightOfFirstRefusal)?.data, FormatterKeys.rightOfFirstRefusal)}
        // `

        case FormatterKeys.assignability:

            additionalInstructions += `
            ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === "governingLaw")?.data, "governingLaw")}
            ${objectToXml(contract.formatted_info.find((fi) => fi.formatter_key === "license")?.data, "license")} `

    }

    if (additionalInstructions !== "")
        inst += `<additionalInfo>\n${additionalInstructions} \n < /additionalInfo>`

    return inst
}

export async function getDataFormatted(formatter: Formatter_SB, contract: ContractWithFormattedInfo, dataInput: string, singleMode: boolean): Promise<IResp<any[]>> {

    if (!contract.target) {
        return rerm("Please set the target", {})
    }

    const instruction = await buildInstruction(formatter, contract, singleMode)


    const res = await generateAgentJsonResponse(instruction, dataInput)

    if (res.error) {
        return res
    }

    if (res.ok == null) {
        // console.warn(`No data from ${formatterKey} formatter`)
        return rok([])
    }

    const responseShape = getFormatterShape(formatter.key)
    const parse = responseShape.safeParse(res.ok)
    if (!parse.success) {
        console.error("Failed to parse ", res.ok, parse.error.errors)
        return rerm("Incorrect shape", parse.error, "bad_shape")
    }

    const formattedData: z.infer<typeof responseShape> = parse.data
    return rok([formattedData])




}

























