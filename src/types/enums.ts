export enum ExtractJobStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETE = "complete",
    FAILED = "failed"
}


export enum FormatterKeys {
    agreementInfo = "agreementInfo",
    incorporatedAgreements = "incorporatedAgreements",
    term = "term",
    termination = "termination",
    license = "license",
    sourceCode = "sourceCode",
    ipOwnership = "ipOwnership",
    paymentTerms = "paymentTerms",
    convenantNotToSue = "covenantNotToSue",
    mostFavoredNation = "mostFavoredNation",
    nonSolicitHire = "nonSolicitHire",
    rightOfFirstRefusal = "rightOfFirstRefusal",
    warranties = "warranties",
    limitationOfLiability = "limitationOfLiability",
    indemnities = "indemnities",
    nonCompete = "nonCompete",
    trojans = "trojans",
    effectsOfTransaction = "effectsOfTransaction",
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

export enum ContractJobTypes {
    FullReview = "full_contract_review",
    PdfContractParse = "pdf_contract_parse",
}