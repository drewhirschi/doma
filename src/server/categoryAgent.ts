import { IResp, rerm, rok } from "@/utils";

import { Database } from "@/types/supabase-generated";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { generateAgentResponse } from "./formatAgent";
import { z } from "zod"

export const agreementsTypes = {
    customer_agreement: "outbound terms of service, terms and conditions, master services agreement (whether for software, hardware or SaaS) or professional services agreement where Target Entity is providing services to their customers",
    supply_agreement: "inbound vendor, supplier or services agreements, including any inbound terms of service, terms and conditions, master services agreement (whether for software, hardware or SaaS) or professional services agreement where Target Entity is the customer",
    distribution_agreement: "Agreement related to distributor, reseller, sales rep, value added reseller, or similar services. Indicate whether inbound (Target Entity is receiving) or outbound (Target Entity is providing)",
    non_disclosure_agreement: "Confidentiality agreement",
    contractor_agreement: "Target Entity hires an independent, individual contractor",
    employee_agreement: "Agreement regards Target Entity employee relationship",
    intercompany_agreement: "agreement is between relates solely to the Target Entity, could be agreement between affiliates",
    joint_development_agreement: "parties jointly develop something",
    collaboration_agreements: "Partnership agreements, collaboration agreements or joint ventures",
    data_processing_agreement: "governs how data is processed",
    settlement_agreement: "Settlement or other resolution of claim or conflict",
    standards_setting_bodies_agreements: "",
    advertising_agreement: "Advertising insertion order/terms and conditions",
    publishing_agreement: "Agreement with a publisher or ad agency",
    marketing_inbound_agreement: "Inbound marketing agreement",
    marketing_outbound_agreement: "Outbound marketing agreement",
    marketing_joint_agreement: "Joint marketing agreement",
    marketing_cross_agreement: "Cross marketing agreement",
    unknown: "Document does not fit any of the above categories",
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

    const oaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    

    const systemMessage = `
You are a meticulous M&A lawyer tasked with tagging documents based on up to the first 500 tokens of the document.
Your response must be JSON and will have the format {"tag": string, "description": string}.
The target of the M&A deal is ${target}.

For the description, respond with a brief description of the document, what it is and who it involves. Don't go over 20 words.
For the tag, respond with the key of the tag (text only, not </>) that best fits and nothing more from these options:

<tags>
${Object.entries(agreementsTypes).map(([key, value]) => `<${key} description="${value}"/>`).join("\n")}
</tags>`

    const shape = z.object({
        tag: z.string({ required_error: "Tag is required" }),
        description: z.string({ required_error: "Description is required" }),
    })

    const response = await generateAgentResponse<z.infer<typeof shape>>(oaiClient, systemMessage, first500Tokens.str, shape)

    if (response.error || !response.ok) {
        return response
    }

    const contractUpdate = await sb.from("contract").update({ "description": response.ok.description, "tag": response.ok.tag }).eq("id", contractId)

    return rok(response.ok)

}