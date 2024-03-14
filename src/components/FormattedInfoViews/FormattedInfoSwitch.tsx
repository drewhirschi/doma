import { ActionIcon, Anchor, Group, Stack, Text, Title } from "@mantine/core";
import { AgreementInfoFormatResponse, IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes";
import { Icon3dRotate, IconPrompt } from "@tabler/icons-react";

import { ErrorBoundary } from "react-error-boundary";
import { FormattedAgreementInfo } from "./AgreementInfo";
import { FormattedAssignability } from "./Assignability";
import { FormattedGeneric } from "./Generic";
import { FormattedIpOwnership } from "./IpOwnership"
import { FormattedLicense } from "./License";
import { FormattedPaymentTerms } from "./PaymentTerm";
import { FormattedSourceCode } from "./SourceCode";
import { FormattedTerm } from "./Term";
import { FormattedTermination } from "./Termination";
import { FormattedTrojans } from "./Trojans";
import { FormatterKeys } from "@/types/enums";
import { FormatterWithInfoAndEi } from "@/types/complex";

export function FormatterSwitch({ formatter, singleRun, handleSave }: { formatter: FormatterWithInfoAndEi, singleRun: (key: string) => void, handleSave: (info: any) => Promise<void> }) {

    const body = () => {

        switch (formatter.key) {
            case FormatterKeys.agreementInfo:
                return (<FormattedAgreementInfo
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}
                />);

            case FormatterKeys.term:
                return <FormattedTerm
                    handleSave={handleSave}

                    info={formatter.formatted_info[0]} />
            case FormatterKeys.termination:
                return <FormattedTermination
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}
                />;
            case FormatterKeys.license:
                return <FormattedLicense
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}
                />;
            case FormatterKeys.sourceCode:
                return <FormattedSourceCode
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}
                />;
            case FormatterKeys.ipOwnership:
                return (<FormattedIpOwnership
                    info={formatter.formatted_info[0]}
                    handleSave={handleSave}
                />);
            case FormatterKeys.paymentTerms:
                return <FormattedPaymentTerms
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}
                />;

            // case FormatterKeys.nonSolicit:
            // case FormatterKeys.nonCompete:
            // case FormatterKeys.nonHire:
            case FormatterKeys.trojans:
                return <FormattedTrojans
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}
                />;
            // case FormatterKeys.effectsOfTransaction:
            // case FormatterKeys.mostFavoredNation:
            case FormatterKeys.assignability:
                return <FormattedAssignability
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}

                />
            case FormatterKeys.governingLaw:
            default:
                return <FormattedGeneric
                    handleSave={handleSave}
                    info={formatter.formatted_info[0]}
                />;
        }
    }


    return (
        <Stack gap={4}>
            <Group>
                <Title order={3}>{formatter.display_name}</Title>
                <ActionIcon size={"sm"}
                    onClick={() => {
                        singleRun(formatter.key)
                    }}
                >
                    <IconPrompt size={16} />
                </ActionIcon>
            </Group>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                {body()}
            </ErrorBoundary>
        </Stack>

    )



}

