import { ItemViewProps } from "@/components/FormattedInfoViews/FormattedItemList";
import { z } from "zod";

export function buildListShape(itemShape: z.ZodObject<any>, options?: { itemsDescription: string }) {
    return z.object({
        items: itemShape.array().describe(options?.itemsDescription ?? ""),
    });
}
export interface IFormatResponse {
    summary: string;
}

export const GenericFormatResponseShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
});

export type GenericFormatResponse = z.infer<typeof GenericFormatResponseShape>;




export const AgreementInfoShape = z.object({
    title: z.string().nullable(),
    counter_party: z.string().nullable(),
    alternate_counter_party_names: z.string().array()
        .describe("list of any other names or titles the counterparty is referred to as. These are often mentioned right aftet the counterparty's name in the agreement, sometimes in parentheses or quotes."),
    target_entity: z.string().nullable(),
    alternate_target_entity_names: z.string().array()
        .describe("list of any other names, referential terms, or aliases of the target entity is referred to as. These are often mentioned right aftet the target's name in parentheses.  If only one party is named and the other party is given a generic title such as 'you', 'contracting party', 'licensor' then that generic title should be assumed as the Target Entity."),
    effective_date: z.coerce.date().nullable()
        .describe("What date did or will the agreement go into effect? Format the date as YYYY/MM/DD"),
    summary: z.string().nullable()
        .describe(`Summarize in the following format by replacing the brackets with the specified information if provided: "[Title] between [Counterparty] and [Target Entity] dated [Effective Date in long date format]". If there are amendments, addendums, or statements of work add the following wording with the brackets filled in with the applicable information: ", as amended [list amendment dates], including [Statement(s) of Work/Addend(um)/(a)] dated [list dates] [(as amended [list dates])]`),
    incorporatedAgreements: z.string().array()
        .describe(`List the names of any amendments, addendums, or statements of work that are incorporated into the agreement.`),
});

export type AgreementInfoFormatResponse = z.infer<typeof AgreementInfoShape>;





export const TermShape = z.object({
    summary: z.string().nullable()
        .describe("Summarize the term of the agreement along with any renewals from the contract's term sections provided below."),
    // silent: z.boolean().nullable()
    //     .describe("Silent if there is no term or renewals"),
    expired: z.boolean().nullable()
        .describe("Expired if a contract states an end date or a time frame without automatic renewals that when applied to the date in the Agreement Info is past today's date."),
    expireDate: z.date()
        .nullable()
        .describe("This should be the date the agreement was signed"),
});
export type TermFormatResponse = z.infer<typeof TermShape>;


export enum TerminationTag {
    CONVENIENCE = "CONVENIENCE",
    CHANGE_OF_CONTROL_TERMINATION = "CHANGE_OF_CONTROL_TERMINATION",
    TERMINATED = "TERMINATED",
}
export const TerminationItemShape = z.object({
    summary: z.string().nullable()
        .describe(`Summarize the termination rights of the Counterparty from the contract's termination sections provided below.
Examples: 
when tag = ${TerminationTag.CONVENIENCE}) Grubhub may terminate these Terms or suspend or terminate your access to the Site, at any time for any reason or no reason, with or without notice"
(when tag = ${TerminationTag.CHANGE_OF_CONTROL_TERMINATION}) Either party may terminate this agreement if the other party is acquired by another entity
(when tag = ${TerminationTag.TERMINATED}) License Agreement dated September 5, 2020`),
    tag: z.nativeEnum(TerminationTag).nullable()
        .describe(`${TerminationTag.TERMINATED} if a mentioned contract is said to be terminated.
${TerminationTag.CHANGE_OF_CONTROL_TERMINATION} if the counterparty can terminate the contract if they are acquired, merge with another company.
${TerminationTag.CONVENIENCE} if the counterparty can terminate the contract at any time for any reason or out of convenience.`),
    lineRefs: z.number().array()
        .describe("Return the line numbers of the contract that support the summary and tag filled in."),
})

export const TerminationShape = z.object({
    plan: z.string().describe("Explain what data seems relevant to filling out the termination items."),
    items: TerminationItemShape.array().describe("Return one object for each right with the summary and tag filled in."),
    justification: z.string().describe("Justify how you filled out the items."),
})

export type TerminationFormatResponse = z.infer<typeof TerminationShape>;

export enum LicenseDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
    CROSS_LICENSE = "CROSS_LICENSE",
}

export enum LicenseSuffix {
    PATENT = "PATENT",
    TRADEMARK = "TRADEMARK",
    SOURCE_CODE_LICENSE = "SOURCE_CODE_LICENSE",
    EXCLUSIVE = "EXCLUSIVE",
    FEEDBACK = "FEEDBACK",
    NONE = "",
}

export const LicenseItemShape = z.object({
    summary: z.string().nullable()
        .describe(`Paraphrase the licenses that are being granted from the license specific sections from the contract by providing the material that is being licensed, the scope, and the rights granted.`),
    direction: z.nativeEnum(LicenseDirection).nullable().describe(`
    INBOUND: License is directed to the Target Entity.
    OUTBOUND: License is given by the Target Entity.
    CROSS_LICENSE: License is both given by and directed to the Target Entity.`),
    type: z.nativeEnum(LicenseSuffix).nullable()
        .describe(`Add these suffixes to the provided categories if applicable: 
    "PATENT" for a Patent license. 
    "TRADEMARK" for a Trademark license. 
    "SOURCE_CODE_LICENSE" for a Source Code license, not an object code license. 
    "FEEDBACK" if the license is for using feedback, comments, or suggestions and not for software.`),
    exclusive: z.boolean().nullable(),
    lineRefs: z.number().array()
        .describe("Return the line numbers of the contract that support the summary and tag filled in.")
})
export const LicenseShape = z.object({
    plan: z.string().describe("Explain what data seems relevant to filling out the license items."),
    items: LicenseItemShape.array(),
    justification: z.string().describe("Justify how you filled out the items."),
});

export type LicenseFormatResponse = z.infer<typeof LicenseShape>;


export const SourceCodeShape = z.object({
    content: z.string().nullable()
        .describe(`Describe the materials being placed into escrow.`),
    releaseConditions: z.string().nullable()
        .describe("What are all the conditions giving rise to release of materials?"),
    license: z.string().nullable()
        .describe("Describe the license granted to the materials after they have been released."),
})

export type SourceCodeFormatResponse = z.infer<typeof SourceCodeShape>;






export enum IpOwnershipType {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
    JOINT = "JOINT_OWNERSHIP"
}
export const IPOwnershipItemShape = z.object({
    summary: z.string().nullable()
        .describe(`Paraphrase the assignments that are being granted from the IP ownership specific sections from the contract by providing the assignment language and what material that is being assigned along with the scope.`),
    direction: z.nativeEnum(IpOwnershipType).nullable()
        .describe(`Chose one option, "INBOUND" if it is directed to the Target Entity, "OUTBOUND" if it is given by the Target Entity, or "JOINT_OWNERSHIP" if it is owned by both the Target Entity and the counterparty. Leave null if not applicable.`),
    not_present_assignment: z.boolean().nullable()
        .describe(`true if the language states a future promise rather than present assignment for example “shall own” or “agrees to assign”. Otherwise false.`),
    feedback: z.boolean().nullable()
        .describe(`true if the assignment is for feedback, comments, or suggestions only. Otherwise false.`),
    refId: z.string().nullable()
        .describe("what is the id of the extraction that supports this item?")
})
export const IPOwnershipShape = z.object({
    items: IPOwnershipItemShape.array(),
});

export type IPOwnershipFormatResponse = z.infer<typeof IPOwnershipShape>;


export enum PaymentTermsDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
}
export const PaymentTermsItemShape = z.object({
    summary: z.string().nullable()
        .describe(`Summarize and label the payment obligations from the payment term sections provided below. `),
    direction: z.nativeEnum(PaymentTermsDirection).nullable()
        .describe(`"INBOUND" if it is directed to the Target Entity or "OUTBOUND" if it is given by the Target Entity. `),
    royalty: z.boolean().nullable()
        .describe(`True if the payment is a royalty. Otherwise false.`),
})




export const CovenantNotToSueItemShape = z.object({
    summary: z.string().nullable()
        .describe("Summary of one item the target entity agrees not to sue the counterparty for."),
})





export const MostFavoredNationShape = z.object({
    summary: z.string().nullable().describe("Summarzie the MFN clause."),
});

// buildListShape(MostFavoredNationShape, {itemsDescription: "List of Most Favored Nation clauses."})

export type MostFavoredNationFormatResponse = z.infer<typeof MostFavoredNationShape>;



export const NonSolicitHireShape = z.object({
    summary: z.string().nullable().describe("Summarize the non-solicitation of hire clause."),
});
buildListShape(NonSolicitHireShape, { itemsDescription: "List of summaries of non-solicitation of hire clauses." })



export const RightOfFirstRefusalShape = z.object({
    summary: z.string().nullable().describe("Summarize the right of first refusal clause."),
});



export const WarrantyShape = z.object({
    summary: z.string().nullable().describe("Summarize the warranty"),
    noWaiver: z.boolean().nullable().describe("False if it says either “as is” or something along the lines of 'disclaims warranties'. This only applies if the target entity is offering services or products."),
});



export const LimitationOfLiabilityShape = z.object({
    directDamagesLimit: z.object({
        waived: z.boolean().nullable().describe("True if the limit is waived"),
        silent: z.boolean().nullable().describe("True if the limit is silent"),
        amount: z.string().nullable().describe("The amount of the limit"),
    }).nullable(),
    directDamagesExceptions: z.string().nullable().array().describe(`specify the exceptions to the relevant limit for example: Indemnification obligations `),
    consequentialDamagesLimit: z.object({
        waived: z.boolean().nullable().describe("True if the limit is waived"),
        silent: z.boolean().nullable().describe("True if the limit is silent"),
        amount: z.string().nullable().describe("The amount of the limit"),
    }).nullable().describe("        Special, punitive, indirect, incidental or consequential damages all should be considered under consequential damages for our purposes."),
    consequentialDamagesExceptions: z.string().nullable().array().describe(`specify the exceptions to the relevant limit for example:  Breaches of confidentiality and indemnification obligations `),
}).describe("Summarize and label the limitation of liability sections.");
export type LimitationOfLiabilityFormatResponse = z.infer<typeof LimitationOfLiabilityShape>;

export const IndemnitiesShape = z.object({
    summary: z.string().nullable().describe("Summarize the indemnity in under 20 words"),
    inclusive: z.boolean().nullable().describe("True if the indemnity is not limited to third-party claims"),
    ipInfringe: z.boolean().nullable().describe("True for outbound IP infringement indemnification obligations (look for an indemnity relating to IP claims, or indemnification for breach of non-infringement warranty)"),

});
export type IndemnitiesFormatResponse = z.infer<typeof IndemnitiesShape>;

export const NonCompeteShape = z.object({
    summary: z.string().nullable().describe("Summarize the non-compete in less than 20 words."),
});
export type NonCompeteFormatResponse = z.infer<typeof NonCompeteShape>;


export const EffectsOfTransactionShape = z.object({
    summary: z.string().nullable().describe("Summarize the effect of transaction in less than 20 words."),
});
export type EffectsOfTransactionFormatResponse = z.infer<typeof EffectsOfTransactionShape>;




export const TrojanShape = z.object({
    summary: z.string().nullable().describe("Summarize and flag any provisions that could apply to a company that purchases the [Target]. This could be the case when the provision binds the [Target] and its affiliates or the definition describing the obligated party includes affiliates."),
});
export type TrojanFormatResponse = z.infer<typeof TrojanShape>;



export const GoverningLawShape = z.object({
    jurisdiction: z.string().nullable().describe("The jurisdiction that governs."),
    condition: z.string().nullable().describe("Give the condition for this jurisdiction or null if it is always the governing jurisdiciton."),
});

export type GoverningLawFormatResponse = z.infer<typeof GoverningLawShape>;



export enum AssignabilitySuffix {
    EXPRESS = "EXPRESS",
    NOTICE = "NOTICE",
    FOREIGN = "FOREIGN",
    SQL = "SQL",
}

export enum AssignabilityType {
    AFFILIATE = "AFFILIATE",
    AFREE = "AFREE",
    ACOMP = "ACOMP",
    COC = "COC",
    COCIMP = "COCIMP",
    CFREE = "CFREE",
    CCOMP = "CCOMP",
    CTERM = "CTERM",
    NA = "NA",
    SILENT = "SILENT",
}
export const AssignabilityShape = z.object({
    summary: z.string().nullable().describe("Summaraize the assignability clauses."),
    type: z.nativeEnum(AssignabilityType).nullable().array()
        .describe(`AFFILIATE: Agreement is expressly assignable by Target to an affiliate.
AFREE: Agreement expressly assignable by Target without restriction by its terms (no mention of a change of control).
ACOMP: Agreement expressly assignable by Target without restriction by its terms (no mention of a change of control), except that Target may not assign to a competitor of the Counterparty.
COC: Agreement is not assignable by Target, including in connection with a change of control either because the agreement prohibits assignment in the context of a change of control or it is implied.
COCIMP: Agreement is not assignable by either party, but the Counterparty may assign in connection with a merger.
CFREE: Agreement is freely assignable by Target but only in the context of a change of control.
CTERM: the counterparty may terminate in connection with a change of control involving Target.
CCOMP: Agreement expressly restricts Target's right to assign to a competitor in the context of a change of control (e.g., either party may assign this agreement in connection with a merger that does not involve a competitor of the other party).
NA: Agreement is not assignable by Target with no mention of a change of control. 
SILENT: Agreement is silent on Target's right to assign (including where the agreement includes express language governing Counterparty's right to assign). `),
    suffix: z.array(z.nativeEnum(AssignabilitySuffix))
        .describe(`"EXPRESS" = The Agreement expressly provides that a change of control causes or gives rise to an assignment by Target (e.g., a merger or acquisition will be “deemed to cause” an assignment of the agreement). 
    "NOTICE" = A permitted assignment requires written notice.
    "FOREIGN" = Agreement is silent on Target's right to assign in the context of a change of control and governed by non-US law (i.e. NA or SILENT + foreign law).
    "SQL" = Agreement is silent or prohibits assignment in connection with a change of control, includes an inbound IP license that is not expressly transferable, and is not governed by Delaware law (e.g., COC, NA, or SILENT plus an inbound IP assignment that is not expressly transferable and is governed by New York law).`),
});
export type AssignabilityFormatResponse = z.infer<typeof AssignabilityShape>;






