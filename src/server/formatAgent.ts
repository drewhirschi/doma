import { Database } from "@/types/supabase-generated";
import { IPOwnershipFormatResponse } from "@/types/formatters";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";

export async function runAllFormatters(sb: SupabaseClient<Database>, contractId: string) {
    const oaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const formatters: IFormatter[] = [new IpOwnership()]
    const results = await Promise.all(formatters.map((f) => f.run(oaiClient, sb, contractId)))
    return results
}

async function execFormatter<T>(oaiClient: OpenAI, sysMessage: string, input: string): Promise<T | null> {


    const res = await oaiClient.chat.completions.create({
        messages: [{
            role: 'system',
            content: sysMessage
        },
        {
            role: "user",
            content: input
        }],
        model: 'gpt-4-turbo-preview',
        temperature: 0,
        response_format: { 'type': "json_object" }
    });

    try {
        if (!res.choices[0].message.content) {
            throw new Error("No formatter message content")
        }
        const json = JSON.parse(res.choices[0].message.content);
        return json as T;
    } catch (error) {
        return null
    }

}


interface IFormatter {
    instruction: string;
    run: (oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string) => Promise<any>;
}

function getSystemMessage(targetEntity: string) {

    return `You are a meticulous M&A lawyer tasked with condensing and formatting key contract information pulled from the Target Entity's contracts. The Target Entity is "${targetEntity}". Counterparty is any party that is not a Target Entity. 
Do not provide explanations, just respond with JSON according to the schema`
}




class IpOwnership implements IFormatter {
    instruction: string = `
        <schema>
    
        <property>
        <key>paraphasing</key>
        <instruction>Paraphrase the assignments that are being granted from the IP ownership specific sections from the contract by providing the assignment language and what material that is being assigned along with the scope.</instruction>
        </property>

        <property>
        <key>type</key>
        <instruction>Chose one option, "INBOUND" if it is directed to the Target Entity, "OUTBOUND" if it is given by the Target Entity, or "JOINT_OWNERSHIP" if it is owned by both the Target Entity and the counterparty.</instruction>
        </property>
        
        <property>
        <key>not_present_assignment</key>
        <instruction>true if the language states a future promise rather than present assignment for example “shall own” or “agrees to assign”. Otherwise false.</instruction>
        </property>
        
        <property>
        <key>feedback</key>
        <instruction>true if the assignment is for feedback, comments, or suggestions only. Otherwise false.</instruction>
        </property>
        </schema>
     
    
   
    `;
    key: string = "ip_ownership"



    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string): Promise<IPOwnershipFormatResponse> {

        console.log("Running IP Ownership Formatter")

        const IP_OWNERSHIP_EXTRACTOR_ID = "084fc678-f4c0-4e54-9524-0597a3330316"
        const eiq = await sb.from("extracted_information").select("*, contract_line(*)").eq("contract_id", contractId).eq("parslet_id", IP_OWNERSHIP_EXTRACTOR_ID)

        if (eiq.error) {
            throw new Error(eiq.error.message)
        }

        const input = `<contract_extraction topic="ip_ownership">${eiq.data.flatMap((d) => d.contract_line.map((cl) => `<line id=${cl.id}>${cl.text}</line>`)).join("\n")}</contract_extraction>`

        console.log(getSystemMessage("Target Entity") + this.instruction)
        console.log(input)

        const res = await execFormatter<IPOwnershipFormatResponse>(oaiClient, getSystemMessage("Target Entity") + this.instruction, input)

        if (!res) {
            throw new Error("No response from formatter")
        }

        const {error:fiErr} = await sb.from("formatted_info").upsert({
            contract_id: contractId,
            formatter_key: this.key,
            data: res,
        })

        if (fiErr) {
            throw new Error(fiErr.message)
        }

        const refUpsert = await sb.from("fi_ei_refs").upsert( eiq.data.map((ei) => ({formatter_key: this.key, extracted_info_id: ei.id, contract_id: contractId})))


        console.log("IP Ownership Formatter done.")
        return res

    }
}