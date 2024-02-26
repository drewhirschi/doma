export type IPOwnershipFormatResponse = {
    paraphrasing: string;
    type: "INBOUND" | "OUTBOUND" | "JOINT_OWNERSHIP";
    not_present_assignment: boolean;
    feedback: boolean;
}