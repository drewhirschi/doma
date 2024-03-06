export interface IFormatResponse {
    summary: string;
}

export interface IPOwnershipFormatResponse extends IFormatResponse {
    type: "INBOUND" | "OUTBOUND" | "JOINT_OWNERSHIP";
    not_present_assignment: boolean;
    feedback: boolean;
}

export interface AgreementInfoFormatResponse extends IFormatResponse {
    title: string;
    counter_party: string;
    target_entity: string;
    effective_date: string;
}

export interface TermFormatResponse extends IFormatResponse {
    silent: boolean;
    expired: boolean;
}

export interface TerminationFormatResponse extends IFormatResponse {
    tag: "CONVENIENCE" | "CHANGE_OF_CONTROL_TERMINATION" | "TERMINATED";
}


export interface PaymentTermsFormatResponse extends IFormatResponse {
    direction: "INBOUND" | "OUTBOUND";
    royalty: boolean;
}

export interface LicenseFormatResponse extends IFormatResponse {
    direction: "INBOUND" | "OUTBOUND" | "CROSS_LICENSE";
    suffix: LicenseSuffix;
}

enum LicenseSuffix {
    PATENT = "PATENT",
    TRADEMARK = "TRADEMARK",
    SOURCE_CODE_LICENSE = "SOURCE_CODE_LICENSE",
    EXCLUSIVE = "EXCLUSIVE",
    FEEDBACK = "FEEDBACK",
}

export interface AssignabilityFormatResponse extends IFormatResponse {
    tag: AssignabilityTag,
    suffix: AssignabilitySuffix[];
}

enum AssignabilitySuffix {
    EXPRESS = "EXPRESS",
    NOTICE = "NOTICE",
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

export interface AssignabilityLabels { foreign: boolean, sql: boolean }


export interface SourceCodeFormatResponse extends IFormatResponse {
     content:string
     releaseConditions: string
     license: string
}

