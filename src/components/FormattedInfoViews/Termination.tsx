import { Anchor, Badge, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core"

import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"
import { TerminationFormatResponse } from "@/types/formattersTypes"

interface Props {
    info?: FormattedInfoWithEiId
}

export function FormattedTermination({ info }: Props) {
    const data: TerminationFormatResponse | undefined = info?.data as unknown as TerminationFormatResponse | undefined
   





    return (
        <Stack gap={4}>
            <Text size="sm">{data?.summary}</Text>

            <SimpleGrid cols={2} spacing="md">
                <MetadataItem header="Tag" text={data?.tag ?? ""} />

            </SimpleGrid>
        </Stack>
    )
}