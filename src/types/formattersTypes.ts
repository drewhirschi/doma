import { z } from "zod";

export interface IFormatResponse {
    summary: string;
}

export const GenericFormatResponseShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
});

export type GenericFormatResponse = z.infer<typeof GenericFormatResponseShape>;


export enum IpOwnershipType {
    "INBOUND", "OUTBOUND", "JOINT_OWNERSHIP"
}
export const IPOwnershipShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
    type: z.nativeEnum(IpOwnershipType),
    not_present_assignment: z.boolean(),
    feedback: z.boolean(),
});

export type IPOwnershipFormatResponse = z.infer<typeof IPOwnershipShape>;



export const AgreementInfoShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
    title: z.string({ required_error: "Title is required" }),
    counter_party: z.string({ required_error: "Counter party is required" }),
    target_entity: z.string({ required_error: "Target entity is required" }),
    effective_date: z.string({ required_error: "Effective date is required" }),
});

export type AgreementInfoFormatResponse = z.infer<typeof AgreementInfoShape>;

export const TermShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
    silent: z.boolean(),
    expired: z.boolean(),
    expireDate: z.string().nullable()
});
export type TermFormatResponse = z.infer<typeof TermShape>;


enum TerminationTag {
    CONVENIENCE = "CONVENIENCE",
    CHANGE_OF_CONTROL_TERMINATION = "CHANGE_OF_CONTROL_TERMINATION",
    TERMINATED = "TERMINATED",
}
export const TerminationShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
    tag: z.nativeEnum(TerminationTag),
});

export type TerminationFormatResponse = z.infer<typeof TerminationShape>;





enum PaymentTermsDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
}

export const PaymentTermsShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
    direction: z.nativeEnum(PaymentTermsDirection),
    royalty: z.boolean(),
});

export type PaymentTermsFormatResponse = z.infer<typeof PaymentTermsShape>;


enum LicenseDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
    CROSS_LICENSE = "CROSS_LICENSE",
}

enum LicenseSuffix {
    PATENT = "PATENT",
    TRADEMARK = "TRADEMARK",
    SOURCE_CODE_LICENSE = "SOURCE_CODE_LICENSE",
    EXCLUSIVE = "EXCLUSIVE",
    FEEDBACK = "FEEDBACK",
    NONE = "",
}
export const LicenseShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
    direction: z.nativeEnum(LicenseDirection),
    suffix: z.nativeEnum(LicenseSuffix),
});

export type LicenseFormatResponse = z.infer<typeof LicenseShape>;


export const SourceCodeFormatResponseShape = z.object({
    summary: z.string({ required_error: "Summary is required" }),
    content: z.string({ required_error: "Content is required" }),
    releaseConditions: z.string({ required_error: "Release conditions are required" }),
    license: z.string({ required_error: "License is required" }),
})

export type SourceCodeFormatResponse = z.infer<typeof SourceCodeFormatResponseShape>;


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






