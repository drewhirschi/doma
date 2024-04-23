import { Group, Loader, Stack, Text, Title } from "@mantine/core";

import { ErrorBoundary } from "react-error-boundary";
import { FormattedAgreementInfo } from "./AgreementInfo";
import { FormattedAssignability } from "./Assignability";
import { FormattedGeneric } from "./Generic";
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
import { FormatterKeys } from "@/types/enums";
import { FormatterWithInfo } from "@/types/complex";
import { UnknownFormatter } from "./UnknownFormatter";

interface Props {
    formatter: FormatterWithInfo,
    singleRun: (key: string) => void,
    handleSave: (infos: FormattedInfo_SB[]) => Promise<void>,
    annotations: Annotation_SB[]
    removeAnnotation: (id: string) => Promise<void>
    removeItem: (id: number) => Promise<void>
    isLoading: boolean
    contractId: string
}

export function FormatterSwitch({ formatter, isLoading, handleSave, annotations, removeAnnotation, contractId, removeItem }: Props) {

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
            case FormatterKeys.warranties:
                return FormattedLimitationOfLiability
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
                return FormattedGeneric

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
                info={formatter.formatted_info}
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
                info={formatter.formatted_info}
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
            <Group>
                <Title
                    order={3}
                    c={formatter.formatted_info.length == 0 ? "gray" : "black"}
                >{formatter.display_name}</Title>
                {isLoading && <Loader size="xs" />}
                {/* <ActionIcon size={"sm"}
                    onClick={() => {
                        singleRun(formatter.key)
                    }}
                >
                    <IconPrompt size={16} />
                </ActionIcon> */}
            </Group>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                {body()}
            </ErrorBoundary>
        </Stack>

    )



}

