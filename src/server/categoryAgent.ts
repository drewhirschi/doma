import { IResp, rerm, rok } from "@/utils";

import { AgreementTypes } from "@/types/enums";
import { Database } from "@/types/supabase-generated";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { generateAgentResponse } from "./formatAgent";
import { z } from "zod"

export const agreementsTypeInstructions = {
    [AgreementTypes.Customer]: "outbound terms of service, terms and conditions, master services agreement (whether for software, hardware or SaaS) or professional services agreement where Target Entity is providing services to their customers",
    [AgreementTypes.Supply]: "inbound vendor, supplier or services agreements, including any inbound terms of service, terms and conditions, master services agreement (whether for software, hardware or SaaS) or professional services agreement where Target Entity is the customer",
    [AgreementTypes.Distribution]: "Agreement related to distributor, reseller, sales rep, value added reseller, or similar services. Indicate whether inbound (Target Entity is receiving) or outbound (Target Entity is providing)",
    [AgreementTypes.NonDisclosure]: "Confidentiality agreement",
    [AgreementTypes.Contractor]: "Target Entity hires an independent, individual contractor",
    [AgreementTypes.Employee]: "Agreement regards Target Entity employee relationship",
    [AgreementTypes.Intercompany]: "agreement is between relates solely to the Target Entity, could be agreement between affiliates",
    [AgreementTypes.JointDevelopment]: "parties jointly develop something",
    [AgreementTypes.Collaboration]: "Partnership agreements, collaboration agreements or joint ventures",
    [AgreementTypes.DataProcessing]: "governs how data is processed",
    [AgreementTypes.Settlement]: "Settlement or other resolution of claim or conflict",
    [AgreementTypes.StandardsSettingBodies]: "",
    [AgreementTypes.Advertising]: "Advertising insertion order/terms and conditions",
    [AgreementTypes.Publishing]: "Agreement with a publisher or ad agency",
    [AgreementTypes.MarketingInbound]: "Inbound marketing agreement",
    [AgreementTypes.MarketingOutbound]: "Outbound marketing agreement",
    [AgreementTypes.MarketingJoint]: "Joint marketing agreement",
    [AgreementTypes.MarketingCross]: "Cross marketing agreement",
    [AgreementTypes.Unknown]: "Document does not fit any of the above categories",
};

export async function categorize(sb: SupabaseClient<Database>, contractId: string, projectId: string, target: string): Promise<IResp<any>> {
    const linesq = await sb.from("contract_line").select("id, page, text, ntokens").eq("contract_id", contractId).lte("page", 3)

    if (!linesq.data) {
        console.error(linesq.error)
        return rerm("Failed to fetch first three pages", linesq.error)
    }

    const first500Tokens = linesq.data.reduce((acc, line) => {
        if (acc.n + line.ntokens > 500) {
            return acc
        }
        return { str: acc.str + line.text + " ", n: acc.n + line.ntokens }
    }, { str: "", n: 0 })

   

    

    const systemMessage = `
You are a meticulous M&A lawyer tasked with tagging documents based on up to the first 500 tokens of the document.
Your response must be JSON and will have the format {"tag": string, "description": string}.
The target of the M&A deal is ${target}.

For the description, respond with a brief description of the document, what it is and who it involves. Don't go over 20 words.
For the tag, respond with the key of the tag (text only, not </>) that best fits and nothing more from these options:

<tags>
${Object.entries(agreementsTypeInstructions).map(([key, value]) => `<${key} description="${value}"/>`).join("\n")}
</tags>`

    const shape = z.object({
        tag: z.nativeEnum(AgreementTypes),
        description: z.string({ required_error: "Description is required" }),
    })

    const response = await generateAgentResponse(systemMessage, first500Tokens.str)
    
    if (response.error) {
        return response
    }

    const parse = shape.safeParse(response.ok)

    if (!parse.success) {
        console.error("Failed to parse ", response.ok, parse.error.errors)
        return rerm("Incorrect shape", parse.error, "bad_shape")
    }

    const contractUpdate = await sb.from("contract").update({ "description": response.ok.description, "tag": response.ok.tag }).eq("id", contractId)

    return rok(response.ok)

}