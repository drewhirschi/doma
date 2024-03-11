import { AgreementInfoFormatResponse, AgreementInfoShape, AssignabilityFormatResponse, AssignabilityShape, GenericFormatResponse, GenericFormatResponseShape, IPOwnershipFormatResponse, IPOwnershipShape, LicenseFormatResponse, LicenseShape, PaymentTermsFormatResponse, PaymentTermsShape, SourceCodeFormatResponse, SourceCodeFormatResponseShape, TermFormatResponse, TermShape, TerminationFormatResponse, TerminationShape, TrojanShape } from "@/types/formattersTypes";
import { Database, Json } from "@/types/supabase-generated";
import { IResp, ISuccessResp, isEmptyObject, objectToXml, rerm, rok } from "@/utils";
import { UnknownKeysParam, ZodObject, ZodTypeAny } from "zod";

import { FormatterKeys } from "@/types/enums";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";

interface IFormatter {
    instruction: string;
    responseShape: ZodObject<any>
    key: string;
    name: string;
    run: (oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string) => Promise<IResp<GenericFormatResponse | null>>
}



export async function runSingleFormatter(sb: SupabaseClient<Database>, formatter_key: string, contractId: string, targetEntityName: string): Promise<any | null> {
    const oaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    let res
    switch (formatter_key) {
        case FormatterKeys.ipOwnership:
            const ipOwnership = new IpOwnership()
            res = await ipOwnership.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.agreementInfo:
            const agreementInfo = new AgreementInfo()
            res = await agreementInfo.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.term:
            const term = new Term()
            res = await term.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.termination:
            const termination = new Termination()
            res = await termination.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.license:
            const license = new License()
            res = await license.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.sourceCode:
            const sourceCode = new SourceCode()
            res = await sourceCode.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.paymentTerms:
            const paymentTerms = new PaymentTerms()
            res = await paymentTerms.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.limitationOfLiability:
            const limitationOfLiability = new LimitationOfLiability()
            res = await limitationOfLiability.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.nonSolicit:
            const nonSolicit = new NonSolicit()
            res = await nonSolicit.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.nonHire:
            const nonHire = new NonHire()
            res = await nonHire.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.nonCompete:
            const nonCompetes = new NonCompetes()
            res = await nonCompetes.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.trojans:
            const trojans = new Trojans()
            res = await trojans.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.effectsOfTransaction:
            const effectsOfTransaction = new EffectsOfTransaction()
            res = await effectsOfTransaction.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.mostFavoredNation:
            const mostFavoredNation = new MostFavoredNation()
            res = await mostFavoredNation.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.governingLaw:
            const governingLaw = new GoverningLaw()
            res = await governingLaw.run(oaiClient, sb, contractId, targetEntityName)
            break;

        case FormatterKeys.assignability:
            const assignability = new Assignability()
            res = await assignability.run(oaiClient, sb, contractId, targetEntityName)
            break;

        default:
            throw new Error("Unknown formatter key")
    }
    if (res.error) {
        console.error(`There was an error running formatter [${formatter_key}] on contract [${contractId}]`, res.error)
    } else {
        return res.ok
    }
}

export async function runAllFormatters(sb: SupabaseClient<Database>, contractId: string, targetEntityName: string) {

    const results = []
    for (const formatter_key in FormatterKeys) {
        const res = await runSingleFormatter(sb, formatter_key, contractId, targetEntityName)
        if (res.error) {
            console.error(`There was an error running formatter [${formatter_key}] on contract [${contractId}]`, res.error)
        } else {
            results.push(res.ok)
        }
    }


    return results
}

export async function generateAgentResponse<T>(oaiClient: OpenAI, sysMessage: string, input: string, responseShape: ZodObject<any>): Promise<IResp<T | null>> {


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
            return rerm("No formatter message content", {})
        }
        const json = JSON.parse(res.choices[0].message.content);
        const parse = responseShape.safeParse(json)
        if (!parse.success) {
            return rerm("Incorrect shape", parse.error, "bad_shape")
        }
        return rok(json as T | null);
    } catch (error) {
        return rerm("Error parsing formatter response", { error })
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

    return `You are a meticulous M&A lawyer tasked with condensing and formatting key contract information pulled from the Target Entity's contracts.
    The Target Entity is "${targetEntity}". Counterparty is any party that is not a Target Entity. If only one party is named and the other party is given a generic title such as "you", "contracting party", "licensor" then that generic title should be assumed as the Target Entity.
Do not provide explanations, just respond with JSON according to the schema.` + formatterInstruction
}


async function runFormatter<T>(formatter: IFormatter, oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<T | null>> {

    console.log(`Running ${formatter.name} Formatter`)

    const formatterq = await sb.from("formatters")
        .select("*, parslet(id)")
        .eq("key", formatter.key).single()

    const eiq = await sb.from("extracted_information")
        .select("*, contract_line(*)")
        .eq("contract_id", contractId)
        .in("parslet_id", formatterq.data?.parslet.map((p) => p.id) ?? [])

    if (eiq.error) {
        return rerm("Error fetching related extractions.", eiq.error)
    }

    //if there isn't any extracted info there is nothing to format.
    if (eiq.data.length === 0) {
        console.log(`Skipping ${formatter.name} formatter, there are no related extractions.`)
        return rok(null)
    }

    const input = `<contract_extraction topic=${formatter.key}>${eiq.data.flatMap((d) => d.contract_line.map((cl) => `<line id=${cl.id}>${cl.text}</line>`)).join("\n")}</contract_extraction>`

    // console.log(getSystemMessage("Target Entity", this.instruction))
    // console.log(input)

    const res = await generateAgentResponse<T>(oaiClient, getSystemMessage(targetEntityName, formatter.instruction), input, formatter.responseShape)

    if (res.error) {
        return res
    }

    if (res.ok == null) {
        console.warn(`No data from ${formatter.name} formatter`)
        return rok(null)
    }

    const { error: fiErr } = await sb.from("formatted_info").upsert({
        contract_id: contractId,
        formatter_key: formatter.key,
        data: res.ok as unknown as Json,
    })

    if (fiErr) {
        return rerm("There was an error upserting the formatted info.", fiErr)
    }

    const refUpsert = await sb.from("fi_ei_refs").upsert(eiq.data.map((ei) => ({ formatter_key: formatter.key, extracted_info_id: ei.id, contract_id: contractId })))


    console.log(`Finished ${formatter.name} formatter`)
    return res as IResp<T>

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
    key: string = FormatterKeys.agreementInfo
    name: string = "Agreement Info"
    responseShape = AgreementInfoShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<AgreementInfoFormatResponse | null>> {

        return await runFormatter<AgreementInfoFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
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
    key: string = FormatterKeys.ipOwnership
    name: string = "IP Ownership"
    responseShape = IPOwnershipShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<IPOwnershipFormatResponse | null>> {

        return await runFormatter<IPOwnershipFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
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
    key: string = FormatterKeys.term
    name: string = "Term"

    responseShape = TermShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<TermFormatResponse | null>> {

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
    key: string = FormatterKeys.termination
    name: string = "Termination"
    responseShape = TerminationShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<TerminationFormatResponse | null>> {

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
            suffix: `choose one of the following:  "PATENT", "TRADEMARK", "SOURCE_CODE_LICENSE", "EXCLUSIVE", "FEEDBACK", or "" if non apply.`

        }
    instruction: string = buildInstruction(this.data)
    key: string = FormatterKeys.license
    name: string = "License"
    responseShape = LicenseShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<LicenseFormatResponse | null>> {

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

    key: string = FormatterKeys.sourceCode
    name: string = "Source Code"
    responseShape = SourceCodeFormatResponseShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<SourceCodeFormatResponse | null>> {

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
    responseShape = PaymentTermsShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<PaymentTermsFormatResponse | null>> {

        return await runFormatter<PaymentTermsFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
//TODO: WHAT ARE THE POSSIBLE TYPES OF LIMITATIONS OF LIABILITY
class LimitationOfLiability implements IFormatter {
    data: GenericFormatResponse = {
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
    responseShape = GenericFormatResponseShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        return await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class NonSolicit implements IFormatter {
    data: GenericFormatResponse = {
        summary: "What are the non-solcit obligations."
    }
    instruction: string = buildInstruction(this.data)
    key: string = FormatterKeys.nonSolicit
    name: string = "Non-Solicit"
    responseShape = GenericFormatResponseShape

    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        return await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class NonHire implements IFormatter {

    data: GenericFormatResponse = {
        summary: "Summarize as a string the non-hire obligations."
    }
    instruction: string = buildInstruction(this.data)
    key: string = FormatterKeys.nonHire
    name: string = "Non-hire"
    responseShape = GenericFormatResponseShape

    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        return await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class NonCompetes implements IFormatter {

    data: GenericFormatResponse = {
        summary: "What are the non compete clauses. Remove all exclusive licenses/non-solicit/non-hire references."
    }
    instruction: string = buildInstruction(this.data)
    key: string = FormatterKeys.nonCompete
    name: string = "Non-Competes"
    responseShape = GenericFormatResponseShape

    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        return await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}
class Trojans implements IFormatter {
    data: GenericFormatResponse = {
        summary: "Summarize the trojans. Clauses that will be enforced on the buyer of the Target. This must be a string."
    }
    instruction: string = buildInstruction(this.data)
    key: string = FormatterKeys.trojans
    name: string = "Trojans"
    responseShape = TrojanShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        const res = await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
        if (res.ok) {

            const parse = TrojanShape.safeParse(res.ok)
            if (!parse.success) {
                return rerm("Error parsing trojan format", parse.error)

            }
        }
        return res
    }
}
class EffectsOfTransaction implements IFormatter {
    data: GenericFormatResponse = {
        summary: "Summaraize the effects of the transaction."
    }
    instruction: string = buildInstruction(this.data)
    key: string = FormatterKeys.effectsOfTransaction
    name: string = "Effects Of Transaction"
    responseShape = GenericFormatResponseShape
    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        return await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }

}
class MostFavoredNation implements IFormatter {

    data: GenericFormatResponse = {
        summary: "Summaraize the most favored nation clauses. Don't include things about exclusive licenses/non-solicit/non-hire references."
    }
    instruction: string = buildInstruction(this.data)

    key: string = FormatterKeys.mostFavoredNation
    name: string = "Most Favored Nation"
    responseShape = GenericFormatResponseShape

    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        return await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
    }
}

class GoverningLaw implements IFormatter {

    data: GenericFormatResponse = {
        summary: "From the governing law sections from the contract provide the jurisdiction that governs. Possibly it will have multiple jurisdictions depending on a condition such as location of the Target or Entity. List the jurisdictions and the conditions for each."
    }
    instruction: string = buildInstruction(this.data)
    responseShape = GenericFormatResponseShape
    key: string = FormatterKeys.governingLaw
    name: string = "Governing Law"

    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<GenericFormatResponse | null>> {

        return await runFormatter<GenericFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)
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
            "FOREIGN" = Agreement is silent on Target's right to assign in the context of a change of control and governed by non-US law (i.e. NA or SILENT + foreign law). Answer true or false.
            "SQL" = Agreement is silent or prohibits assignment in connection with a change of control, includes an inbound IP license that is not expressly transferable, and is not governed by Delaware law (e.g., COC, NA, or SILENT plus an inbound IP assignment that is not expressly transferable and is governed by New York law). Answer true or false.
            `
        }
    instruction: string = buildInstruction(this.data)
    responseShape = AssignabilityShape

    key: string = FormatterKeys.assignability
    name: string = "Assignability"


    async run(oaiClient: OpenAI, sb: SupabaseClient<Database>, contractId: string, targetEntityName: string): Promise<IResp<AssignabilityFormatResponse | null>> {


        const fiDeps = await sb.from("formatted_info").select("*").eq("contract_id", contractId).eq("formatter_key", "governingLaw").eq("formatter_key", "license")

        if (fiDeps.error) {
            return rerm("Error fetching related formatted info.", fiDeps.error)
        }


        const input = `
        ${objectToXml(fiDeps.data.find((fi) => fi.formatter_key === "governingLaw")?.data, "governingLaw")}
        ${objectToXml(fiDeps.data.find((fi) => fi.formatter_key === "license")?.data, "license")}`

        this.instruction += input

        const formattedAssignability = await runFormatter<AssignabilityFormatResponse>(this, oaiClient, sb, contractId, targetEntityName)

        if (formattedAssignability.ok) {
            const parse = TrojanShape.safeParse(formattedAssignability.ok)
            if (!parse.success) {
                return rerm("Error parsing assignability format", parse.error)
            }
        }

        return formattedAssignability


    }
}






