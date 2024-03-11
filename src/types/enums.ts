export enum ExtractJobStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETE = "complete",
    FAILED = "failed"
}


export enum FormatterKeys {
    ipOwnership = "ipOwnership",
    agreementInfo = "agreementInfo",
    term = "term",
    termination = "termination",
    license = "license",
    sourceCode = "sourceCode",
    paymentTerms = "paymentTerms",
    limitationOfLiability = "limitationOfLiability",
    nonSolicit = "nonSolicit",
    nonHire = "nonHire",
    nonCompete = "nonCompete",
    trojans = "trojans",
    effectsOfTransaction = "effectsOfTransaction",
    mostFavoredNation = "mostFavoredNation",
    governingLaw = "governingLaw",
    assignability = "assignability"
}

export enum AgreementTypes {
    Customer = "customer_agreement",
    Supply = "supply_agreement",
    Distribution = "distribution_agreement",
    NonDisclosure = "non_disclosure_agreement",
    Contractor = "contractor_agreement",
    Employee = "employee_agreement",
    Intercompany = "intercompany_agreement",
    JointDevelopment = "joint_development_agreement",
    Collaboration = "collaboration_agreement",
    DataProcessing = "data_processing_agreement",
    Settlement = "settlement_agreement",
    StandardsSettingBodies = "standards_setting_bodies_agreements",
    Advertising = "advertising_agreement",
    Publishing = "publishing_agreement",
    MarketingInbound = "marketing_inbound_agreement",
    MarketingOutbound = "marketing_outbound_agreement",
    MarketingJoint = "marketing_joint_agreement",
    MarketingCross = "marketing_cross_agreement",
    Unknown = "unknown",
}