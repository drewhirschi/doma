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