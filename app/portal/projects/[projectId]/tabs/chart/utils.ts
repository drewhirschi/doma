import {
    AgreementInfoFormatResponse,
    AssignabilityShape,
    AssignabilityType,
    CovenantNotToSueItemShape,
    EffectsOfTransactionShape,
    GoverningLawShape,
    IPOwnershipItemShape,
    IndemnitiesShape,
    IpOwnershipType,
    LicenseDirection,
    LicenseItemShape,
    LicenseSuffix,
    LimitationOfLiabilityShape,
    MostFavoredNationShape,
    NonCompeteShape,
    NonSolicitHireShape,
    PaymentTermsDirection,
    PaymentTermsItemShape,
    RightOfFirstRefusalShape,
    SourceCodeShape,
    TermShape,
    TerminationItemShape,
    TrojanShape,
    WarrantyShape
} from "@/types/formattersTypes";

import { FormatterKeys } from "@/types/enums";
import { formatKey } from "@/utils";
import { z } from "zod";

interface Props {
    infoArray: (FormattedInfo_SB & { annotation: Annotation_SB[] })[]
    projectId: string
}



// function getAnnotationLinks(annotations: Annotation_SB[], projectId: string, contractId: string) {

//     return annotations.map((ann, i) => <ContractReviewerLink
//         key={ann.id}
//         projectId={projectId}
//         contractId={contractId}
//         from={"chart"}
//         annotationId={ann.id}
//     >[{i + 1}]</ContractReviewerLink>)
// }

export function formattedInfoStr({infoArray, projectId}: Props): string {

    if (infoArray.length === 0) {
        return ""
    }

    const key = infoArray[0].formatter_key
    if (key === FormatterKeys.agreementInfo) {
        return (infoArray[0].data as AgreementInfoFormatResponse).summary + "\n"


    } else if (key === FormatterKeys.license) {


        const directionColor = (direction: LicenseDirection) => {
            switch (direction) {
                case LicenseDirection.INBOUND:
                    return "lime"
                case LicenseDirection.OUTBOUND:
                    return "pink"
                case LicenseDirection.CROSS_LICENSE:
                    return "orange"
            }
        }

        const typeColor = (type: LicenseSuffix) => {
            switch (type) {
                case LicenseSuffix.PATENT:
                    return "blue"
                case LicenseSuffix.TRADEMARK:
                    return "cyan"
                case LicenseSuffix.SOURCE_CODE_LICENSE:
                    return "indigo"
                case LicenseSuffix.FEEDBACK:
                    return "violet"
            }

        }

        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof LicenseItemShape>
            let str = ""
            if (data.exclusive) str += "[Exclusive] "
            if (data.direction) str += `${formatKey(data.direction)} `
            if (data.type) str += `${formatKey(data.type)} `

            str += data.summary
            // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}

            return str


        }).join("\n")

    } else if (key === FormatterKeys.ipOwnership) {


        const directionColor = (direction: IpOwnershipType) => {
            switch (direction) {
                case IpOwnershipType.INBOUND:
                    return "lime"
                case IpOwnershipType.OUTBOUND:
                    return "pink"
                case IpOwnershipType.JOINT:
                    return "orange"
            }
        }



        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof IPOwnershipItemShape>
            let str = ""
            if (data.not_present_assignment) str += "[No present assignment] "
            if (data.feedback) str += "[Feedback] "
            if (data.direction) str += `${formatKey(data.direction)} `

            str += data.summary
            // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}

            return str
        }).join("\n")


    } else if (key === FormatterKeys.paymentTerms) {

        const directionColor = (direction: PaymentTermsDirection) => {
            switch (direction) {
                case PaymentTermsDirection.INBOUND:
                    return "lime"
                case PaymentTermsDirection.OUTBOUND:
                    return "pink"
            }
        }
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof PaymentTermsItemShape>
            let str = ""
            if (data.royalty) str += "[Feedback] "
            if (data.direction) str += `${formatKey(data.direction)} `

            str += data.summary
            // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}

            return str
        }).join("\n")


    } else if (key === FormatterKeys.assignability) {

        const data = infoArray[0].data as z.infer<typeof AssignabilityShape>
        console.log(data.type)
        return data.suffix?.map((s) => `[${s}] `).join('') +
            data.type?.filter(Boolean)?.map((type: AssignabilityType | null) => `${formatKey(type!)} `).join('') +
            data.summary +
            "\n" +
            // {getAnnotationLinks(infoArray[0].annotation, projectId, infoArray[0].contract_id)}
            ''


    } else if (key === FormatterKeys.term) {
        const data = infoArray[0].data as z.infer<typeof TermShape>
        return data.summary + "\n" +
            // {getAnnotationLinks(infoArray[0].annotation, projectId, infoArray[0].contract_id)}
            ''

    } else if (key === FormatterKeys.termination) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof TerminationItemShape>
            return data.summary + "\n" +
                // {getAnnotationLinks(infoArray[0].annotation, projectId, infoArray[0].contract_id)}
                ''

        }).join("\n")
    } else if (key === FormatterKeys.sourceCode) {

        const data = infoArray[0].data as z.infer<typeof SourceCodeShape>
        return data.content + "\n" +
            data.license + "\n" +
            data.releaseConditions + "\n" +
            // {getAnnotationLinks(infoArray[0].annotation, projectId, infoArray[0].contract_id)}
            ''


    } else if (key === FormatterKeys.convenantNotToSue) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof CovenantNotToSueItemShape>
            return data.summary + "\n" +
                // {getAnnotationLinks(infoArray[0].annotation, projectId, infoArray[0].contract_id)}
                ''
        }).join("\n")


    } else if (key === FormatterKeys.mostFavoredNation) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof MostFavoredNationShape>
            return data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''

        }).join("\n")


    } else if (key === FormatterKeys.nonSolicitHire) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof NonSolicitHireShape>
            let str = data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")



    } else if (key === FormatterKeys.rightOfFirstRefusal) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof RightOfFirstRefusalShape>
            let str = data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")



    } else if (key === FormatterKeys.warranties) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof WarrantyShape>
            let str = data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")



    } else if (key === FormatterKeys.limitationOfLiability) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof LimitationOfLiabilityShape>
            let str = (data.consequentialDamagesLimit?.amount ?? '') + "\n" +
                (data.consequentialDamagesExceptions ?? '') + "\n" +
                (data.directDamagesLimit?.amount ?? '') + "\n" +
                (data.directDamagesExceptions ?? '') + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")



    } else if (key === FormatterKeys.indemnities) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof IndemnitiesShape>
            let str = data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")



    } else if (key === FormatterKeys.nonCompete) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof NonCompeteShape>
            let str = data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")



    } else if (key === FormatterKeys.effectsOfTransaction) {

        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof EffectsOfTransactionShape>
            let str = data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")


    } else if (key === FormatterKeys.trojans) {
        return infoArray.map((info) => {
            const data = info.data as z.infer<typeof TrojanShape>
            let str = data.summary + "\n" +
                // {getAnnotationLinks(info.annotation, projectId, info.contract_id)}
                ''
            return str
        }).join("\n")



    } else if (key === FormatterKeys.governingLaw) {
        const data = infoArray[0].data as z.infer<typeof GoverningLawShape>
        return data.jurisdiction + "\n" +
            data.condition + "\n" +
            // {getAnnotationLinks(infoArray[0].annotation, projectId, infoArray[0].contract_id)}
            ''



    }


    return ""

}