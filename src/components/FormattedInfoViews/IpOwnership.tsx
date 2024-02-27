import { Anchor, Badge, Group, Text, Title } from "@mantine/core"

import { IPOwnershipFormatResponse } from "@/types/formatters"

interface Props {
    data: IPOwnershipFormatResponse
    extractedInfoRefs: string[]
}

export function FormattedIpOwnership({ data, extractedInfoRefs }: Props) {

    function typeBadge(type: IPOwnershipFormatResponse["type"]) {
        switch (type) {
            case "INBOUND":
                return <Badge color="blue">Inbound</Badge>
            case "OUTBOUND":
                return <Badge color="green">Outbound</Badge>
            case "JOINT_OWNERSHIP":
                return <Badge color="orange">Joint ownership</Badge>

            default:
                return <Badge color="gray">Unknown type</Badge>
        }
    }

    return (
        <div>
            <Group>
                <Title order={3}>IP Ownership</Title>

                {typeBadge(data.type)}
                {data.not_present_assignment && <Badge>+Not present assignment</Badge>}
                {data.feedback && <Badge>+Feedback</Badge>}
            </Group>
            <Text>{data.summary}</Text>
            {extractedInfoRefs.map((id,index)=> (
                <Anchor key={id} href={`#${id}`}>[{index+1}]</Anchor>
            ))}

        </div>
    )
}