import { ActionIcon, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { use, useEffect, useState } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { FormattedAgreementInfo } from "./AgreementInfo";
import { FormattedAssignability } from "./Assignability";
import { FormattedGoverningLaw } from "./GoverningLaw";
import { FormattedIndemnities } from "./Indemnities";
import { FormattedInfoView } from "./FormattedItemSingle";
import { FormattedIpOwnership } from "./IpOwnership"
import { FormattedItemList } from "./FormattedItemList";
import { FormattedLicense } from "./License";
import { FormattedLimitationOfLiability } from "./LimitationOfLiability";
import { FormattedPaymentTerms } from "./PaymentTerm";
import { FormattedSourceCode } from "./SourceCode";
import { FormattedSummaryList } from "./SummaryList";
import { FormattedTerm } from "./Term";
import { FormattedTermination } from "./Termination";
import { FormattedWarranty } from "./Warranty";
import { FormatterKeys } from "@/types/enums";
import { FormatterWithInfo } from "@/types/complex";
import { IconTrash } from "@tabler/icons-react";
import { UnknownFormatter } from "./UnknownFormatter";

interface Props {
    formatter: FormatterWithInfo,
    singleRun: (key: string) => void,
    handleSave: (infoId: number, data: any) => Promise<void>,
    annotations: Annotation_SB[]
    removeAnnotation: (id: string) => Promise<void>
    removeItem: (id: number) => Promise<void>
    isLoading: boolean
    contractId: string
}

export function FormatterSwitch({ formatter, isLoading, handleSave, annotations, removeAnnotation, contractId, removeItem }: Props) {

   const [formattedInfo, setFormattedInfo] = useState(formatter.formatted_info)
    

    const insideView = () => {

        switch (formatter.key) {
            case FormatterKeys.agreementInfo:
                return FormattedAgreementInfo

            case FormatterKeys.term:
                return FormattedTerm

            case FormatterKeys.termination:
                return FormattedTermination

            case FormatterKeys.license:
                return FormattedLicense

            case FormatterKeys.sourceCode:
                return FormattedSourceCode

            case FormatterKeys.ipOwnership:
                return FormattedIpOwnership

            case FormatterKeys.paymentTerms:
                return FormattedPaymentTerms


            case FormatterKeys.limitationOfLiability:
                return FormattedLimitationOfLiability
            case FormatterKeys.warranties:
                return FormattedWarranty
            case FormatterKeys.indemnities:
                return FormattedIndemnities


            case FormatterKeys.convenantNotToSue:
            case FormatterKeys.mostFavoredNation:
            case FormatterKeys.nonSolicitHire:
            case FormatterKeys.rightOfFirstRefusal:



            case FormatterKeys.nonCompete:
            case FormatterKeys.trojans:
            case FormatterKeys.effectsOfTransaction:
                return FormattedSummaryList
            case FormatterKeys.governingLaw:
                return FormattedGoverningLaw

            case FormatterKeys.assignability:
                return FormattedAssignability



            default:
                return UnknownFormatter
        }
    }

    function body() {

        if (formatter.hitems) {
            return <FormattedItemList
                handleSave={handleSave}
                info={formattedInfo}
                annotations={annotations}
                removeAnnotation={removeAnnotation}
                removeItem={removeItem}
                formatterKey={formatter.key}
                contractId={contractId}
                //@ts-ignore
                ItemView={insideView()}
            />;
        } else {
            return <FormattedInfoView
                handleSave={handleSave}
                info={formattedInfo}
                annotations={annotations}
                removeAnnotation={removeAnnotation}
                formatterKey={formatter.key}
                contractId={contractId}
                //@ts-ignore
                ItemView={insideView()}
            />
        }
    }

    return (
        <Stack gap={4}>
            <Group justify="space-between">
                <Group>

                    <Title
                        order={3}
                        c={formattedInfo.length == 0 ? "gray" : "black"}
                    >{formatter.display_name}</Title>
                    {isLoading && <Loader size="xs" />}
                </Group>

                {!formatter.hitems && formattedInfo.length &&
                    <ActionIcon variant="subtle" color="gray" onClick={async () => {
                        removeItem(0)
                        handleSave(0, {})
                        setFormattedInfo([])
                    }}>

                        <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>}
            </Group>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                {body()}
            </ErrorBoundary>
        </Stack>

    )



}

