import { AgreementInfoShape, AssignabilityShape, CovenantNotToSueItemShape, EffectsOfTransactionShape, GoverningLawShape, IPOwnershipItemShape, IPOwnershipShape, IndemnitiesShape, LicenseItemShape, LicenseShape, LimitationOfLiabilityShape, MostFavoredNationShape, NonCompeteShape, NonSolicitHireShape, PaymentTermsItemShape, RightOfFirstRefusalShape, SourceCodeShape, TermShape, TerminationItemShape, TerminationShape, TrojanShape, WarrantyShape } from "@/types/formattersTypes";

import { FormatterKeys } from "@/types/enums";
import { z } from "zod";

export function getFormatterShape(formatterKey: string) {

    switch (formatterKey) {
        case FormatterKeys.agreementInfo:
            return AgreementInfoShape

        case FormatterKeys.term:
            return TermShape

        case FormatterKeys.termination:
            return TerminationItemShape

        case FormatterKeys.license:
            // return LicenseShape
            return LicenseItemShape

        case FormatterKeys.sourceCode:
            return SourceCodeShape

        case FormatterKeys.ipOwnership:
            // return IPOwnershipShape
            return IPOwnershipItemShape

        case FormatterKeys.paymentTerms:
            // return PaymentTermsShape
            return PaymentTermsItemShape

        case FormatterKeys.convenantNotToSue:
            return CovenantNotToSueItemShape

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
            console.warn(`Formatter key ${formatterKey} not found`)
            return z.object({})
    }
}