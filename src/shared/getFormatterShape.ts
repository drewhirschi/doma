import { AgreementInfoShape, AssignabilityShape, CovenantNotToSueShape, EffectsOfTransactionShape, GoverningLawShape, IPOwnershipShape, IndemnitiesShape, LicenseShape, LimitationOfLiabilityShape, MostFavoredNationShape, NonCompeteShape, NonSolicitHireShape, PaymentTermsShape, RightOfFirstRefusalShape, SourceCodeShape, TermShape, TerminationShape, TrojanShape, WarrantyShape } from "@/types/formattersTypes";

import { FormatterKeys } from "@/types/enums";
import { z } from "zod";

export function getFormatterShape(formatterKey: string) {
    
    switch (formatterKey) {
        case FormatterKeys.ipOwnership:
           return IPOwnershipShape

        case FormatterKeys.agreementInfo:
            return AgreementInfoShape

        case FormatterKeys.term:
            return TermShape

        case FormatterKeys.termination:
            return TerminationShape

        case FormatterKeys.license:
            return LicenseShape

        case FormatterKeys.sourceCode:
            return SourceCodeShape

        case FormatterKeys.paymentTerms:
            return PaymentTermsShape

        case FormatterKeys.convenantNotToSue:
            return CovenantNotToSueShape

        case FormatterKeys.mostFavoredNation:
            return MostFavoredNationShape

        case FormatterKeys.nonSolicitHire:
            return NonSolicitHireShape
           
        case FormatterKeys.rightOfFirstRefusal:
            return RightOfFirstRefusalShape

        case FormatterKeys.warranties:
            return WarrantyShape

        case FormatterKeys.limitationOfLiability:
            return LimitationOfLiabilityShape

        case FormatterKeys.indemnities:
            return IndemnitiesShape

        case FormatterKeys.nonCompete:
            return NonCompeteShape

        case FormatterKeys.effectsOfTransaction:
            return EffectsOfTransactionShape

        case FormatterKeys.trojans:
            return TrojanShape

        case FormatterKeys.governingLaw:
            return GoverningLawShape

        case FormatterKeys.assignability:
            return AssignabilityShape
            

        default:
            return z.object({})
    }
}