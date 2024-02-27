export interface IFormatResponse {
    summary: string;
}

export interface IPOwnershipFormatResponse extends IFormatResponse {
    type: "INBOUND" | "OUTBOUND" | "JOINT_OWNERSHIP";
    not_present_assignment: boolean;
    feedback: boolean;
}