import {
    AgreementInfoFormatResponse,
    AssignabilityShape,
    IPOwnershipItemShape,
    IpOwnershipType,
    LicenseDirection,
    LicenseItemShape,
    LicenseSuffix,
    PaymentTermsDirection,
    PaymentTermsItemShape
} from "@/types/formattersTypes";
import { Anchor, Badge } from "@mantine/core";

import { ContractReviewerLink } from "@/components/PdfViewer/components/ContractReveiwerLink";
import { FormatterKeys } from "@/types/enums";
import { formatKey } from "@/utils";
import { z } from "zod";

interface Props {
    infoArray: (FormattedInfo_SB & { annotation: Annotation_SB[] })[]
    projectId: string
}



function getAnnotationLinks(annotations: Annotation_SB[], projectId: string, contractId: string) {

    return annotations.map((ann, i) => <ContractReviewerLink
        key={ann.id}
        projectId={projectId}
        contractId={contractId}
        from={"chart"}
        annotationId={ann.id}
    >[{i + 1}]</ContractReviewerLink>)
}

export function FormattedInfoView(props: Props) {

    if (props.infoArray.length === 0) {
        return null
    }

    const key = props.infoArray[0].formatter_key
    if (key === FormatterKeys.agreementInfo) {
        return (<>
            {(props.infoArray[0].data as AgreementInfoFormatResponse).summary}
            <br />
            {getAnnotationLinks(props.infoArray[0].annotation, props.projectId, props.infoArray[0].contract_id)}
        </>)
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

        return props.infoArray.map((info) => {
            const data = info.data as z.infer<typeof LicenseItemShape>
            return <div key={info.formatter_key + info.id}>
                {data.exclusive && <Badge color="gray" mx={2}>Exclusive</Badge>}
                {data.direction && <Badge color={directionColor(data.direction)} mx={2}>{formatKey(data.direction)}</Badge>}
                {data.type && <Badge color={typeColor(data.type)} mx={2}>{formatKey(data.type)}</Badge>}

                {data.summary}
                {getAnnotationLinks(info.annotation, props.projectId, info.contract_id)}


            </div>
        })

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



        return props.infoArray.map((info) => {
            const data = info.data as z.infer<typeof IPOwnershipItemShape>
            return <div key={info.formatter_key + info.id}>
                {data.not_present_assignment && <Badge color="gray" mx={2}>No present assignment</Badge>}
                {data.feedback && <Badge color="gray" mx={2}>Feedback</Badge>}
                {data.direction && <Badge color={directionColor(data.direction)} mx={2}>{formatKey(data.direction)}</Badge>}

                {data.summary}
                {getAnnotationLinks(info.annotation, props.projectId, info.contract_id)}


            </div>
        })

    } else if (key === FormatterKeys.paymentTerms) {

        const directionColor = (direction: PaymentTermsDirection) => {
            switch (direction) {
                case PaymentTermsDirection.INBOUND:
                    return "lime"
                case PaymentTermsDirection.OUTBOUND:
                    return "pink"
            }
        }
        return props.infoArray.map((info) => {
            const data = info.data as z.infer<typeof PaymentTermsItemShape>
            return <div key={info.formatter_key + info.id}>
                {data.royalty && <Badge color="yellow" mx={2}>Feedback</Badge>}
                {data.direction && <Badge color={directionColor(data.direction)} mx={2}>{formatKey(data.direction)}</Badge>}

                {data.summary}
                {getAnnotationLinks(info.annotation, props.projectId, info.contract_id)}


            </div>
        })

    } else if (key === FormatterKeys.assignability) {

        const data = props.infoArray[0].data as z.infer<typeof AssignabilityShape>
        return (<>
            {data.suffix?.map((s) => <Badge key={s} color="blue" mx={2}>{s}</Badge>)}
            {data.type && <Badge color={"green"} mx={2}>{formatKey(data.type)}</Badge>}

            {data.summary}
            <br />
            {getAnnotationLinks(props.infoArray[0].annotation, props.projectId, props.infoArray[0].contract_id)}
        </>)
    }



}