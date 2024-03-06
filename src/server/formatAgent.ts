import { AgreementInfoFormatResponse, AssignabilityFormatResponse, AssignabilityLabels, IFormatResponse, IPOwnershipFormatResponse, LicenseFormatResponse, PaymentTermsFormatResponse, SourceCodeFormatResponse, TermFormatResponse, TerminationFormatResponse } from "@/types/formattersTypes";
import { Database, Json } from "@/types/supabase-generated";

import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { objectToXml } from "@/utils";

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
        case "ipOwnership":
            const ipOwnership = new IpOwnership()
            return await ipOwnership.run(oaiClient, sb, contractId, targetEntityName)
        case "agreemenInfo":
            const agreementInfo = new AgreementInfo()
            return await agreementInfo.run(oaiClient, sb, contractId, targetEntityName)
        case "term":
            const term = new Term()
            return await term.run(oaiClient, sb, contractId, targetEntityName)
        case "termination":
            const termination = new Termination()
            return await termination.run(oaiClient, sb, contractId, targetEntityName)
        case "license":
            const license = new License()
            return await license.run(oaiClient, sb, contractId, targetEntityName)
        case "sourceCode":
            const sourceCode = new SourceCode()
            return await sourceCode.run(oaiClient, sb, contractId, targetEntityName)
        case "paymentTerms":
            const paymentTerms = new PaymentTerms()
            return await paymentTerms.run(oaiClient, sb, contractId, targetEntityName)
        case "limitationOfLiability":
            const limitationOfLiability = new LimitationOfLiability()
            return await limitationOfLiability.run(oaiClient, sb, contractId, targetEntityName)
        case "nonSolicit":
            const nonSolicit = new NonSolicit()
            return await nonSolicit.run(oaiClient, sb, contractId, targetEntityName)
        case "nonHire":
            const nonHire = new NonHire()
            return await nonHire.run(oaiClient, sb, contractId, targetEntityName)
        case "nonCompetes":
            const nonCompetes = new NonCompetes()
            return await nonCompetes.run(oaiClient, sb, contractId, targetEntityName)
        case "trojans":
            const trojans = new Trojans()
            return await trojans.run(oaiClient, sb, contractId, targetEntityName)
        case "effectsOfTransaction":
            const effectsOfTransaction = new EffectsOfTransaction()
            return await effectsOfTransaction.run(oaiClient, sb, contractId, targetEntityName)
        case "mostFavoredNation":
            const mostFavoredNation = new MostFavoredNation()
            return await mostFavoredNation.run(oaiClient, sb, contractId, targetEntityName)
        case "governingLaw":
            
        default:
            throw new Error("Unknown formatter key")
    }
}

export async function runAllFormatters(sb: SupabaseClient<Database>, contractId: string, targetEntityName: string) {
    const oaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const formatters: IFormatter[] = [
        new IpOwnership(),
        new AgreementInfo(),
        new Term(),
        new Termination(),
        new License(),
        new SourceCode(),
        new PaymentTerms(),
        new LimitationOfLiability(),
        new NonSolicit(),
        new NonHire(),
        new NonCompetes(),
        new Trojans(),
        new EffectsOfTransaction(),
        new MostFavoredNation(),
        new GoverningLaw(),
        new Assignability()
    ]
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

function buildInstruction(schema: any) {
    return `<schema>
    ${Object.entries(schema).map(([key, value]) => `<property>
    <key>${key}</key>
    <instruction>${value}</instruction>
    </property>
    `)}
    </schema>`
}


function getSystemMessage(targetEntity: string, formatterInstruction: string) {

    return `You are a meticulous M&A lawyer tasked with condensing and formatting key contract information pulled from the Target Entity's contracts. The Target Entity is "${targetEntity}". Counterparty is any party that is not a Target Entity. If only one party is named and the other party is given a generic title such as "you", "contracting party", "licensor" then that generic title should be assumed as the Target Entity.
Do not provide explanations, just respond with JSON according to the schema` + formatterInstruction
}


async function runFormatter<T>(formatter: IFormatter, oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<T> {

    console.log(`Running ${formatter.name} Formatter`)

    const formatterq = await sb.from("formatters")
        .select("*, parslet(id)")
        .eq("key", formatter.key).single()
    const eiq = await sb.from("extracted_information")
        .select("*, contract_line(*)")
        .eq("contract_id", contractId)
        .in("parslet_id", formatterq.data?.parslet.map((p) => p.id) ?? [])


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
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<TermFormatResponse> {

        return await runFormatter<TermFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class Termination implements IFormatter {
    data: {
        [Property in keyof TerminationFormatResponse]: string;
    } = {
            summary: `Summarize the termination rights of the Counterparty from the contract's termination sections provided below. If a mentioned contract is said to be terminated then put “TERMINATED” followed by that contract's details. If applicable, label the termination right: “CHANGE OF CONTROL TERMINATION: ” if the counterparty can terminate the contract if they are acquired, merge with another company, or change of control. “CONVENIENCE: “ if the counterparty can terminate the contract at any time for any reason or out of convenience.
            Examples: 
            CONVENIENCE: Grubhub may terminate these Terms or suspend or terminate your access to the Site, at any time for any reason or no reason, with or without notice"
            CHANGE OF CONTROL TERMINATION: Either party may terminate this agreement if the other party is acquired by another entity
            TERMINATED: License Agreement dated September 5, 2020`,
            tag: `choose one of the following: "CONVENIENCE", "CHANGE_OF_CONTROL_TERMINATION", "TERMINATED"`
        }
    instruction: string = buildInstruction(this.data)
    key: string = "termination"
    name: string = "Termination"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<TerminationFormatResponse> {

        return await runFormatter<TerminationFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class License implements IFormatter {
    data: {
        [Property in keyof LicenseFormatResponse]: string;
    } = {
            summary: `Paraphrase the licenses that are being granted from the license specific sections from the contract by providing the material that is being licensed, the scope, and the rights granted. Label them with "INBOUND: " if it is directed to the Target Entity, "OUTBOUND: " if it is given by the Target Entity, or "CROSS LICENSE: " if it is both given by and directed to the Target Entity. 
            Add these suffixes to the provided categories if applicable: "PATENT" for a Patent license. "TRADEMARK" for a Trademark license. "SOURCE CODE LICENSE" for a Source Code license, not an object code license. "EXCLUSIVE" if a license is Exclusive. "FEEDBACK" if the license is for using feedback, comments, or suggestions and not for software.`,
            direction: `choose one of the following: "INBOUND" or "OUTBOUND" or "CROSS_LICENSE"`,
            suffix: `choose one of the following:  "PATENT", "TRADEMARK", "SOURCE_CODE_LICENSE", "EXCLUSIVE", "FEEDBACK"`

        }
    instruction: string = buildInstruction(this.data)
    key: string = "license"
    name: string = "License"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<LicenseFormatResponse> {

        return await runFormatter<LicenseFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class SourceCode implements IFormatter {

    data: {
        [Property in keyof SourceCodeFormatResponse]: string;
    } = {
            content: `Describe the materials being placed into escrow.`,
            releaseConditions: `What are all the conditions giving rise to release of materials?`,
            license: `Describe the license granted to the materials after they have been released.`,
            summary: `leave blank.`
        }

    instruction: string = buildInstruction(this.data)
    
    key: string = "sourceCode"
    name: string = "Source Code"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<SourceCodeFormatResponse> {

        return await runFormatter<SourceCodeFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class PaymentTerms implements IFormatter {

    data: {
        [Property in keyof PaymentTermsFormatResponse]: string;
    } = {
            summary: `Summarize and label the payment obligations from the payment term sections provided below. Label them with "INBOUND: " if it is directed to the Target Entity or "OUTBOUND: " if it is given by the Target Entity. 
    Add these suffixes to the provided categories if applicable: "ROYALTY" if it is a royalty payment. 
    Example: 
    INBOUND: $500 a month.
    OUTBOUND+ROYALTY: In each case the License also assigns to Imagis all revenues or other payments due by third parties to Intacta from the date of this Agreement.`,
            direction: `"INBOUND" or "OUTBOUND"`,
            royalty: `true or false`
        }

    instruction: string = buildInstruction(this.data)
    key: string = "paymentTerms"
    name: string = "Payment Terms"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<PaymentTermsFormatResponse> {

        return await runFormatter<PaymentTermsFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
//TODO: WHAT ARE THE POSSIBLE TYPES OF LIMITATIONS OF LIABILITY
class LimitationOfLiability implements IFormatter {
    data: IFormatResponse = {
        summary: `Summarize and label the limitation of liability sections and format them similar to example given below. The answer should just be a string. 
        Special, punitive, indirect, incidental or consequential damages all should be considered under consequential damages for our purposes.
        For the limit's provide the limit amount, if it is silent, or waived. For the limit exception's specify the exceptions to the relevant limit.

        Example:
        Direct Damages Limit: Capped at $50,000
        Direct Damages Exceptions: Indemnification obligations 
        Consequential Damages Limit: Waived
        Consequential Damages Exceptions: Breaches of confidentiality and indemnification obligations
        `
    }
    instruction: string = buildInstruction(this.data)
    key: string = "limitationOfLiability"
    name: string = "Limitation Of Liability"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class NonSolicit implements IFormatter {
    data: IFormatResponse = {
        summary: "What are the non-solcit obligations."
    }
    instruction: string = buildInstruction(this.data)
    key: string = "nonSolicit"
    name: string = "Non-Solicit"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class NonHire implements IFormatter {

    data: IFormatResponse = {
        summary: "Summarize as a string the non-hire obligations."
    }
    instruction: string = buildInstruction(this.data)
    key: string = "nonHire"
    name: string = "Non-hire"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class NonCompetes implements IFormatter {

    data: IFormatResponse = {
        summary: "What are the non compete clauses. Remove all exclusive licenses/non-solicit/non-hire references."
    }
    instruction: string = buildInstruction(this.data)
    key: string = "nonCompetes"
    name: string = "Non-Competes"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class Trojans implements IFormatter {
    data: IFormatResponse = {
        summary: "Summarize the trojans. Clauses that will be enforced on the buyer of the Target."
    }
    instruction: string = buildInstruction(this.data)
    key: string = "trojans"
    name: string = "Trojans"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class EffectsOfTransaction implements IFormatter {
    data: IFormatResponse = {
        summary: "Summaraize the effects of the transaction."
    }
    instruction: string = buildInstruction(this.data)
    key: string = "effectsOfTransaction"
    name: string = "Effects Of Transaction"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }

}
class MostFavoredNation implements IFormatter {

    data: IFormatResponse = {
        summary: "Summaraize the most favored nation clauses. Don't include things about exclusive licenses/non-solicit/non-hire references."
    }
    instruction: string = buildInstruction(this.data)

    key: string = "mostFavoredNation"
    name: string = "Most Favored Nation"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class GoverningLaw implements IFormatter {

    data: IFormatResponse = {
        summary: "From the governing law sections from the contract provide the jurisdiction that governs. Possibly it will have multiple jurisdictions depending on a condition such as location of the Target or Entity. List the jurisdictions and the conditions for each."
    }
    instruction: string = buildInstruction(this.data)

    key: string = "governingLaw"
    name: string = "Governing Law"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IFormatResponse> {

        return await runFormatter<IFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class Assignability implements IFormatter {

    data: {
        [Property in keyof AssignabilityFormatResponse]: string;
    } = {
            summary: "Summaraize the assignability clauses.",
            tag: `
        Choose one of the tags that best matches the Assignability sections extracted from the contract: 
AFFILIATE: Agreement is expressly assignable by Target to an affiliate.
AFREE: Agreement expressly assignable by Target without restriction by its terms (no mention of a change of control).
ACOMP: Agreement expressly assignable by Target without restriction by its terms (no mention of a change of control), except that Target may not assign to a competitor of the Counterparty.
COC: Agreement is not assignable by Target, including in connection with a change of control either because the agreement prohibits assignment in the context of a change of control or it is implied.
COC (IMPLIED): Agreement is not assignable by either party, but the Counterparty may assign in connection with a merger.
CFREE: Agreement is freely assignable by Target but only in the context of a change of control.
CTERM: the counterparty may terminate in connection with a change of control involving Target.
CCOMP: Agreement expressly restricts Target's right to assign to a competitor in the context of a change of control (e.g., either party may assign this agreement in connection with a merger that does not involve a competitor of the other party).
NA: Agreement is not assignable by Target with no mention of a change of control. 
SILENT: Agreement is silent on Target's right to assign (including where the agreement includes express language governing Counterparty's right to assign). 
        `,
            suffix: `return an array of the suffixes that apply to the assignability clauses.
            "EXPRESS" = The Agreement expressly provides that a change of control causes or gives rise to an assignment by Target (e.g., a merger or acquisition will be “deemed to cause” an assignment of the agreement). 
            "NOTICE" = A permitted assignment requires written notice.
            `
        }
    instruction: string = buildInstruction(this.data)

    key: string = "assignability"
    name: string = "Assignability"
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<AssignabilityFormatResponse & AssignabilityLabels> {

        const formattedAssignabilityPart1 = await runFormatter<AssignabilityFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
        const part2Schema = {
            foreign: "Agreement is silent on Target's right to assign in the context of a change of control and governed by non-US law (i.e. NA or SILENT + foreign law). Answer true or false.",
            sql: "Agreement is silent or prohibits assignment in connection with a change of control, includes an inbound IP license that is not expressly transferable, and is not governed by Delaware law (e.g., COC, NA, or SILENT plus an inbound IP assignment that is not expressly transferable and is governed by New York law). Answer true or false."
        }


        const fiDeps = await sb.from("formatted_info").select("*").eq("contract_id", contractId).eq("formatter_key", "governingLaw").eq("formatter_key", "license")

        if (fiDeps.error) {
            throw new Error(fiDeps.error.message)
        }


        const input = `${objectToXml(formattedAssignabilityPart1, "assignability")}
        ${objectToXml(fiDeps.data.find((fi) => fi.formatter_key === "governingLaw")?.data, "governingLaw")}
        ${objectToXml(fiDeps.data.find((fi) => fi.formatter_key === "license")?.data, "license")}`

        const res = await generateAgentResponse<AssignabilityLabels>(oaiClient, getSystemMessage(targetEntityName, buildInstruction(part2Schema)), input)

        if (!res) {
            throw new Error("No response from formatter")
        }

        return { ...formattedAssignabilityPart1, ...res }

    }
}






