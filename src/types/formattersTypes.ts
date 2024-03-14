import { FormattedInfoWithEiId } from "./complex";
import { z } from "zod";

export interface FormatterViewProps {
    info: FormattedInfoWithEiId | undefined
    handleSave: (info: any) => Promise<void>
}
export interface IFormatResponse {
    summary: string;
}

export const GenericFormatResponseShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
});

export type GenericFormatResponse = z.infer<typeof GenericFormatResponseShape>;

export const AgreementInfoShape = z.object({
    title: z.string(),
    counter_party: z.string().nullable(),
    target_entity: z.string(),
    effective_date: z.date().nullable()
        .describe("What date did or will the agreement go into effect?"),
    summary: z.string({ required_error: "Summary is required" })
        .describe(`Summarize in the following format by replacing the brackets with the specified information if provided: "[Title] between [Counterparty] and [Target Entity] dated [Effective Date]". If there are amendments, addendums, or statements of work add the following wording with the brackets filled in with the applicable information: ", as amended [list amendment dates], including [Statement(s) of Work/Addend(um)/(a)] dated [list dates] [(as amended [list dates])]`),
});

export type AgreementInfoFormatResponse = z.infer<typeof AgreementInfoShape>;





export const TermShape = z.object({
    summary: z.string()
        .describe("Summarize the term of the agreement along with any renewals from the contract's term sections provided below."),
    silent: z.boolean()
        .describe("Silent if there is no term or renewals"),
    expired: z.boolean()
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
export const TerminationShape = z.object({
    plan: z.string().describe("Explain what data seems relevant to filling out the termination items."),
    items: z.object({
        summary: z.string()
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
    }).array().describe("Return one object for each right with the summary and tag filled in."),
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
export const LicenseShape = z.object({
    plan: z.string().describe("Explain what data seems relevant to filling out the license items."),
    items: z.object({
        summary: z.string()
            .describe(`Paraphrase the licenses that are being granted from the license specific sections from the contract by providing the material that is being licensed, the scope, and the rights granted.`),
        direction: z.nativeEnum(LicenseDirection).describe(`
        INBOUND: License is directed to the Target Entity.
        OUTBOUND: License is given by the Target Entity.
        CROSS_LICENSE: License is both given by and directed to the Target Entity.`),
        suffix: z.nativeEnum(LicenseSuffix).nullable()
            .describe(`Add these suffixes to the provided categories if applicable: 
        "PATENT" for a Patent license. 
        "TRADEMARK" for a Trademark license. 
        "SOURCE CODE LICENSE" for a Source Code license, not an object code license. 
        "EXCLUSIVE" if a license is Exclusive. 
        "FEEDBACK" if the license is for using feedback, comments, or suggestions and not for software.`),
        exclusive: z.boolean().nullable(),
        lineRefs: z.number().array()
            .describe("Return the line numbers of the contract that support the summary and tag filled in.")
    }).array(),
    justification: z.string().describe("Justify how you filled out the items."),
});

export type LicenseFormatResponse = z.infer<typeof LicenseShape>;


export const SourceCodeFormatResponseShape = z.object({
    content: z.string()
        .describe(`Describe the materials being placed into escrow.`),
    releaseConditions: z.string()
        .describe("What are all the conditions giving rise to release of materials?"),
    license: z.string()
        .describe("Describe the license granted to the materials after they have been released."),
})

export type SourceCodeFormatResponse = z.infer<typeof SourceCodeFormatResponseShape>;






export enum IpOwnershipType {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
    JOINT = "JOINT_OWNERSHIP"
}
export const IPOwnershipShape = z.object({
    items: z.object({
        summary: z.string()
            .describe(`Paraphrase the assignments that are being granted from the IP ownership specific sections from the contract by providing the assignment language and what material that is being assigned along with the scope.`),
        direction: z.nativeEnum(IpOwnershipType)
            .describe(`Chose one option, "INBOUND" if it is directed to the Target Entity, "OUTBOUND" if it is given by the Target Entity, or "JOINT_OWNERSHIP" if it is owned by both the Target Entity and the counterparty.`),
        not_present_assignment: z.boolean()
            .describe(`true if the language states a future promise rather than present assignment for example “shall own” or “agrees to assign”. Otherwise false.`),
        feedback: z.boolean()
            .describe(`true if the assignment is for feedback, comments, or suggestions only. Otherwise false.`),
        lineRefs: z.number().array()
            .describe("Return the line numbers of the contract that support the summary and tag filled in.")
    }).array(),
});

export type IPOwnershipFormatResponse = z.infer<typeof IPOwnershipShape>;


export enum PaymentTermsDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
}

export const PaymentTermsShape = z.object({
    items: z.object({
        summary: z.string()
            .describe(`Summarize and label the payment obligations from the payment term sections provided below. `),
        direction: z.nativeEnum(PaymentTermsDirection)
            .describe(`"INBOUND: " if it is directed to the Target Entity or "OUTBOUND"if it is given by the Target Entity. `),
        royalty: z.boolean()
            .describe(`True if the payment is a royalty. Otherwise false.`),
    }).array(),
});

export type PaymentTermsFormatResponse = z.infer<typeof PaymentTermsShape>;


export const TrojanShape = z.object({
    summary: z.string(),
});
export type TrojanFormatResponse = z.infer<typeof TrojanShape>;

enum AssignabilitySuffix {
    EXPRESS = "EXPRESS",
    NOTICE = "NOTICE",
    FOREIGN = "FOREIGN",
    SQL = "SQL",
}

enum AssignabilityTag {
    AFFILIATE = "AFFILIATE",
    AFREE = "AFREE",
    ACOMP = "ACOMP",
    COC = "COC",
    CFREE = "CFREE",
    CCOMP = "CCOMP",
    CTERM = "CTERM",
    NA = "NA",
    SILENT = "SILENT",
}


export const AssignabilityShape = z.object({
    summary: z.string({}),
    tag: z.nativeEnum(AssignabilityTag),
    suffix: z.array(z.nativeEnum(AssignabilitySuffix)),
});
export type AssignabilityFormatResponse = z.infer<typeof AssignabilityShape>;






