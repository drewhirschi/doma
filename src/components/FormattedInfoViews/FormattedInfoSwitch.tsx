import { ActionIcon, Anchor, Group, Stack, Text, Title } from "@mantine/core";
import { AgreementInfoFormatResponse, IFormatResponse, IPOwnershipFormatResponse } from "@/types/formatters";
import { Icon3dRotate, IconPrompt } from "@tabler/icons-react";

import { FormattedAgreementInfo } from "./AgreementInfo";
import { FormattedGeneric } from "./Generic";
import { FormattedIpOwnership } from "./IpOwnership"
import { FormattedTerm } from "./Term";
import { FormattedTermination } from "./Termination";
import { FormatterWithInfoAndEi } from "@/types/complex";
import { IconWifi0 } from "@tabler/icons-react";

export function FormatterSwitch({ formatter, singleRun }: { formatter: FormatterWithInfoAndEi, singleRun: (key: string) => void }) {

    const body = () => {

        switch (formatter.key) {
            case "agreement_info":
                return (<FormattedAgreementInfo
                    info={formatter.formatted_info[0]}
                />);
            case "ip_ownership":
                return (<FormattedIpOwnership
                    info={formatter.formatted_info[0]}
                />);
            case "term":
                return <FormattedTerm
                    info={formatter.formatted_info[0]} />
            case "termination":
                return <FormattedTermination
                    info={formatter.formatted_info[0]}
                />;
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

