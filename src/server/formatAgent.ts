import { AgreementInfoFormatResponse, IFormatResponse, IPOwnershipFormatResponse } from "@/types/formatters";
import { Database, Json } from "@/types/supabase-generated";

import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";

interface IFormatter {
    instruction: string;
    key: string;
    name: string;
    run: (oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string) => Promise<IFormatResponse>
}

export async function runSingleFormatter(sb: SupabaseClient<Database>, formatter_key: string, contractId: string, targetEntityName: string) {
    const oaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    switch (formatter_key) {
        case "ip_ownership":
            const ipOwnership = new IpOwnership()
            return await ipOwnership.run(oaiClient, sb, contractId, targetEntityName)
        case "agreement_info":
            const agreementInfo = new AgreementInfo()
            return await agreementInfo.run(oaiClient, sb, contractId, targetEntityName)
        case "term":
            const term = new Term()
            return await term.run(oaiClient, sb, contractId, targetEntityName)
        case "termination":
            const termination = new Termination()
            return await termination.run(oaiClient, sb, contractId, targetEntityName)
        default:
            throw new Error("Unknown formatter key")
    }
}

export async function runAllFormatters(sb: SupabaseClient<Database>, contractId: string, targetEntityName: string) {
    const oaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const formatters: IFormatter[] = [new IpOwnership(), new AgreementInfo(), new Term(), new Termination()]
    const results = await Promise.all(formatters.map((f) => f.run(oaiClient, sb, contractId, targetEntityName)))
    return results
}

async function generateAgentResponse<T>(oaiClient: OpenAI, sysMessage: string, input: string): Promise<T | null> {


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


function getSystemMessage(targetEntity: string, formatterInstruction: string) {

    return `You are a meticulous M&A lawyer tasked with condensing and formatting key contract information pulled from the Target Entity's contracts. The Target Entity is "${targetEntity}". Counterparty is any party that is not a Target Entity. If only one party is named and the other party is given a generic title such as "you", "contracting party", "licensor" then that generic title should be assumed as the Target Entity.
Do not provide explanations, just respond with JSON according to the schema` + formatterInstruction
}


async function runFormatter<T>(formatter: IFormatter, oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<T> {

    console.log(`Running ${formatter.name} Formatter`)

    const formatterq = await sb.from("formatters").select("*, parslet(id)").eq("key", formatter.key).single()
    const eiq = await sb.from("extracted_information").select("*, contract_line(*)").eq("contract_id", contractId).in("parslet_id", formatterq.data?.parslet.map((p) => p.id) ?? [])


    if (eiq.error) {
        throw new Error(eiq.error.message)
    }

    const input = `<contract_extraction topic=${formatter.key}>${eiq.data.flatMap((d) => d.contract_line.map((cl) => `<line id=${cl.id}>${cl.text}</line>`)).join("\n")}</contract_extraction>`

    // console.log(getSystemMessage("Target Entity", this.instruction))
    // console.log(input)

    const res = await generateAgentResponse<T>(oaiClient, getSystemMessage("Target Entity", formatter.instruction), input)

    if (!res) {
        throw new Error("No response from formatter")
    }

    const { error: fiErr } = await sb.from("formatted_info").upsert({
        contract_id: contractId,
        formatter_key: formatter.key,
        data: res as unknown as Json,
    })

    if (fiErr) {
        throw new Error(fiErr.message)
    }

    const refUpsert = await sb.from("fi_ei_refs").upsert(eiq.data.map((ei) => ({ formatter_key: formatter.key, extracted_info_id: ei.id, contract_id: contractId })))


    console.log(`Finished ${formatter.name} formatter`)
    return res

}




class IpOwnership implements IFormatter {
    instruction: string = `
        <schema>
    
        <property>
        <key>summary</key>
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
    name: string = "IP Ownership"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IPOwnershipFormatResponse> {

        return await runFormatter<IPOwnershipFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }



}

class AgreementInfo implements IFormatter {
    instruction: string = `
        <schema>
    
        <property>
        <key>title</key>
        <instruction></instruction>
        </property>

        <property>
        <key>counter_party</key>
        <instruction></instruction>
        </property>
        
        <property>
        <key>target_entity</key>
        <instruction></instruction>
        </property>
        
        <property>
        <key>effective_date</key>
        <instruction></instruction>
        </property>
        
        <property>
        <key>summary</key>
        <instruction>Summarize in the following format by replacing the brackets with the specified information if provided: "[Title] between [Counterparty] and [Target Entity] dated [Effective Date]". If there are amendments, addendums, or statements of work add the following wording with the brackets filled in with the applicable information: ", as amended [list amendment dates], including [Statement(s) of Work/Addend(um)/(a)] dated [list dates] [(as amended [list dates])]</instruction>
        </property>
        </schema>
     
    `;
    key: string = "agreement_info"
    name: string = "Agreement Info"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<AgreementInfoFormatResponse> {

        return await runFormatter<AgreementInfoFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class Term implements IFormatter {
    instruction: string = `
        <schema>        
        <property>
        <key>summary</key>
        <instruction>Summarize the term of the agreement along with any renewals from the contract's term sections provided below. If there is no term or renewals put “Silent”. If there is a date, reformat it to be month/day/year. If a contract states an end date or a time frame without automatic renewals that when applied to the date in the Agreement Info is past today's date then label it with “EXPIRED”</instruction>
        </property>
        
        <property>
        <key>silent</key>
        <instruction>true or false</instruction>
        </property>
        
        <property>
        <key>expired</key>
        <instruction>true or false</instruction>
        </property>
        </schema>

        Todays date is ${new Date().toISOString()}
     
    `;
    key: string = "term"
    name: string = "Term"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<AgreementInfoFormatResponse> {

        return await runFormatter<AgreementInfoFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class Termination implements IFormatter {
    instruction: string = `
        <schema>        
        <property>
        <key>summary</key>
        <instruction>
        Summarize the termination rights of the Counterparty from the contract's termination sections provided below. If a mentioned contract is said to be terminated then put “TERMINATED” followed by that contract's details. If applicable, label the termination right: “CHANGE OF CONTROL TERMINATION: ” if the counterparty can terminate the contract if they are acquired, merge with another company, or change of control. “CONVENIENCE: “ if the counterparty can terminate the contract at any time for any reason or out of convenience.
Examples: 
CONVENIENCE: Grubhub may terminate these Terms or suspend or terminate your access to the Site, at any time for any reason or no reason, with or without notice"
CHANGE OF CONTROL TERMINATION: Either party may terminate this agreement if the other party is acquired by another entity
TERMINATED: License Agreement dated September 5, 2020
        </instruction>
        </property>
        
        <property>
        <key>tag</key>
        <instruction>choose one of the following: "CONVENIENCE", "CHANGE_OF_CONTROL_TERMINATION", "TERMINATED" </instruction>
        </property>
      
        </schema>

     
    `;
    key: string = "termination"
    name: string = "Termination"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<AgreementInfoFormatResponse> {

        return await runFormatter<AgreementInfoFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

