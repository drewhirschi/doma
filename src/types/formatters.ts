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