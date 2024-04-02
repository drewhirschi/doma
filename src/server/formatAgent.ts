import { AgreementInfoFormatResponse, AgreementInfoShape, AssignabilityFormatResponse, AssignabilityShape, CovenantNotToSueFormatResponse, CovenantNotToSueShape, EffectsOfTransactionFormatResponse, EffectsOfTransactionShape, GenericFormatResponse, GenericFormatResponseShape, GoverningLawFormatResponse, GoverningLawShape, IPOwnershipFormatResponse, IPOwnershipShape, IndemnitiesFormatResponse, IndemnitiesShape, LicenseFormatResponse, LicenseShape, LimitationOfLiabilityFormatResponse, LimitationOfLiabilityShape, MostFavoredNationFormatResponse, MostFavoredNationShape, NonSolicitHireFormatResponse, NonSolicitHireShape, PaymentTermsFormatResponse, PaymentTermsShape, RightOfFirstRefusalFormatResponse, RightOfFirstRefusalShape, SourceCodeFormatResponse, SourceCodeShape, TermFormatResponse, TermShape, TerminationFormatResponse, TerminationShape, TrojanFormatResponse, TrojanShape, WarrantyFormatResponse, WarrantyShape } from "@/types/formattersTypes";
import { Database, Json } from "@/types/supabase-generated";
import { IResp, ISuccessResp, isEmptyObject, objectToXml, rerm, rok } from "@/utils";
import { ZodObject, ZodTypeAny } from "zod";
import { hasItemsChild, zodObjectToXML } from "@/zodUtils";

import { FormatterKeys } from "@/types/enums";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { getFormatterShape } from "@/shared/getFormatterShape";
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






    let res
    switch (formatter_key) {

        case FormatterKeys.term:
            input += `Todays date is ${new Date().toISOString()}`;

        case FormatterKeys.assignability:
            // const assignability = new Assignability()
            // res = await assignability.run(oaiClient, sb, contractId, targetEntityName)

            // const fiDeps = await sb.from("formatted_info").select("*").eq("contract_id", contractId).eq("formatter_key", "governingLaw").eq("formatter_key", "license")

            // if (fiDeps.error) {
            //     return rerm("Error fetching related formatted info.", fiDeps.error)
            // }
    
    
            // const input = `
            // ${objectToXml(fiDeps.data.find((fi) => fi.formatter_key === "governingLaw")?.data, "governingLaw")}
            // ${objectToXml(fiDeps.data.find((fi) => fi.formatter_key === "license")?.data, "license")}`
    
            // this.instruction += input
    
            // const formattedAssignability = await runFormatterFromClass<AssignabilityFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    
            // if (formattedAssignability.ok) {
            //     const parse = TrojanShape.safeParse(formattedAssignability.ok)
            //     if (!parse.success) {
            //         return rerm("Error parsing assignability format", parse.error)
            //     }
            // }
    
            // return formattedAssignability
            res = rerm("Not implemented", { formatter_key })
            break;

        default:
            const shape = getFormatterShape(formatter_key)
            res = await getDataFormatted(zodObjectToXML(shape), shape, targetEntityName, input)
            break;
    }
    return res
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

export async function generateAgentResponse(sysMessage: string, input: string, model = "gpt-4-turbo-preview"): Promise<IResp<any>> {
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


function getSystemMessage(targetEntity: string, formatterInstruction: string) {

    return `You are a meticulous M&A lawyer tasked with condensing and formatting key contract information pulled from the Target Entity's contracts.
The Target Entity is "${targetEntity}". Counterparty is any party that is not a Target Entity. If only one party is named and the other party is given a generic title such as "you", "contracting party", "licensor" then that generic title should be assumed as the Target Entity.
Do not provide explanations, just respond with JSON according to the schema. When a field is nullable, you must respond with the type or null.\n` + formatterInstruction
}

//should this be allows to return multipl items? might want to have a versino for single and multiple
export async function getDataFormatted(instruction: string, responseShape: ZodObject<any>, targetEntityName: string, dataInput: string, model?: string | "gpt-3.5-turbo"): Promise<IResp<any[]>> {



    const res = await generateAgentResponse(getSystemMessage(targetEntityName, instruction), dataInput, model)

    if (res.error) {
        return res
    }

    if (res.ok == null) {
        // console.warn(`No data from ${formatterKey} formatter`)
        return rok([])
    }

    const parse = responseShape.safeParse(res.ok)
    if (!parse.success) {
        console.error("Failed to parse ", res.ok, parse.error.errors)
        return rerm("Incorrect shape", parse.error, "bad_shape")
    }

    const formattedData:z.infer<typeof responseShape> = parse.data
    return rok([formattedData])


    // let dataToUpsert
    // if (hasItemsChild(responseShape)) {
    //     dataToUpsert = formattedData.items.map((item: any, idx: number) => ({
    //         contract_id: contractId,
    //         formatter_key: formatterKey,
    //         data: item as unknown as Json,
    //         id: idx
    //     }))

    // } else {
    //     dataToUpsert = {
    //         contract_id: contractId,
    //         formatter_key: formatterKey,
    //         data: formattedData as unknown as Json,
    //         id: 0
    //     }
    // }
    // const { data, error: fiErr } = await sb.from("formatted_info").upsert(dataToUpsert).select()

    // if (fiErr) {
    //     return rerm("There was an error upserting the formatted info.", fiErr)
    // }




    // return rok() 

}























