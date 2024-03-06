import { Anchor, Badge, Group, Text, Title } from "@mantine/core"

import { FormattedInfoWithEiId } from "@/types/complex"
import { IPOwnershipFormatResponse } from "@/types/formattersTypes"

interface Props {
    info?: FormattedInfoWithEiId

}

export function FormattedIpOwnership({ info }: Props) {

    if (!info) {
        return (

            <Text>No data</Text>
        )
    }


    const data: IPOwnershipFormatResponse = info?.data as unknown as IPOwnershipFormatResponse

    const extractedInfoRefs = info.extracted_information.map(ei => ei.id)

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
                {typeBadge(data.type)}
                {data.not_present_assignment && <Badge>+Not present assignment</Badge>}
                {data.feedback && <Badge>+Feedback</Badge>}
            </Group>
            <Text>{data.summary}</Text>
            {extractedInfoRefs.map((id, index) => (
                <Anchor key={id} href={`#${id}`}>[{index + 1}]</Anchor>
            ))}

        </div>
    )
}