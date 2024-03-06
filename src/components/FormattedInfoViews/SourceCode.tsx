import { Anchor, Badge, Group, Stack, Text, Title } from "@mantine/core"
import { IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes"

import { FormattedInfoWithEiId } from "@/types/complex"

interface Props {
    info: FormattedInfoWithEiId
}

export function FormattedSourceCode({ info }: Props) {

    if (!info) {
        return <Text>No data</Text>
    }
    
    const data: IFormatResponse = info.data as unknown as IFormatResponse

    const extractedInfoRefs = info.extracted_information.map(ei => ei.id)


    return (
        <Stack>
            
            <Text>{data.summary}</Text>
            {extractedInfoRefs.map((id, index) => (
                <Anchor key={id} href={`#${id}`}>[{index + 1}]</Anchor>
            ))}

        </Stack>
    )
}