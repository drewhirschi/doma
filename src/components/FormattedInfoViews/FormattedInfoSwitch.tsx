import { ActionIcon, Anchor, Group, Stack, Text, Title } from "@mantine/core";
import { AgreementInfoFormatResponse, IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes";
import { Icon3dRotate, IconPrompt } from "@tabler/icons-react";

import { FormattedAgreementInfo } from "./AgreementInfo";
import { FormattedGeneric } from "./Generic";
import { FormattedIpOwnership } from "./IpOwnership"
import { FormattedPaymentTerms } from "./PaymentTerm";
import { FormattedSourceCode } from "./SourceCode";
import { FormattedTerm } from "./Term";
import { FormattedTermination } from "./Termination";
import { FormattedTrojans } from "./Trojans";
import { FormatterKeys } from "@/types/enums";
import { FormatterWithInfoAndEi } from "@/types/complex";

export function FormatterSwitch({ formatter, singleRun }: { formatter: FormatterWithInfoAndEi, singleRun: (key: string) => void }) {

    const body = () => {

        switch (formatter.key) {
            case FormatterKeys.agreementInfo:
                return (<FormattedAgreementInfo
                    info={formatter.formatted_info[0]}
                />);
            case FormatterKeys.ipOwnership:
                return (<FormattedIpOwnership
                    info={formatter.formatted_info[0]}
                />);
            case FormatterKeys.term:
                return <FormattedTerm
                    info={formatter.formatted_info[0]} />
            case FormatterKeys.termination:
                return <FormattedTermination
                    info={formatter.formatted_info[0]}
                />;
            case FormatterKeys.license:
            case FormatterKeys.sourceCode:
                return <FormattedSourceCode
                    info={formatter.formatted_info[0]}
                />;
            case FormatterKeys.paymentTerms:
                return <FormattedPaymentTerms
                    info={formatter.formatted_info[0]}
                />;

            case FormatterKeys.nonSolicit:
            case FormatterKeys.nonCompete:
            case FormatterKeys.nonHire:
            case FormatterKeys.trojans:
                return <FormattedTrojans
                    info={formatter.formatted_info[0]}
                />;
            case FormatterKeys.effectsOfTransaction:
            case FormatterKeys.mostFavoredNation:
            case FormatterKeys.governingLaw:
            case FormatterKeys.assignability:
            default:
                return <FormattedGeneric
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
            {body()}
        </Stack>

    )



}

