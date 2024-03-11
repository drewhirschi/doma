import { Anchor, Badge, Group, Text } from "@mantine/core"
import { IPOwnershipFormatResponse, IpOwnershipType } from "@/types/formattersTypes"

import { FormattedInfoWithEiId } from "@/types/complex"

interface Props {
    info?: FormattedInfoWithEiId

}

export function FormattedIpOwnership({ info }: Props) {




    const data = info?.data as unknown as IPOwnershipFormatResponse | undefined


    const extractedInfoRefs = info?.extracted_information?.map(ei => ei.id) ?? []

    function typeBadge(type: IpOwnershipType | undefined) {
        if (!type)
            return <Badge color="gray">Unknown type</Badge>
            
        switch (type) {
            case IpOwnershipType.INBOUND:
                return <Badge color="blue">Inbound</Badge>
            case IpOwnershipType.OUTBOUND:
                return <Badge color="green">Outbound</Badge>
            case IpOwnershipType.JOINT:
                return <Badge color="orange">Joint ownership</Badge>

            default:
                return <Badge color="gray">Unknown type</Badge>
        }
    }

    return (
        <div>
            <Text>{data?.summary}</Text>
            <Group>
                {typeBadge(data?.type)}
                {data?.not_present_assignment && <Badge>+Not present assignment</Badge>}
                {data?.feedback && <Badge>+Feedback</Badge>}
            </Group>
            {extractedInfoRefs.map((id, index) => (
                <Anchor key={id} href={`#${id}`}>[{index + 1}]</Anchor>
            ))}

        </div>
    )
}