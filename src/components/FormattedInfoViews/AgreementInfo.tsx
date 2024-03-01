import { Anchor, Badge, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core"

import { AgreementInfoFormatResponse } from "@/types/formatters"
import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"

interface Props {
    // data: AgreementInfoFormatResponse
    // extractedInfoRefs: string[]
    info?: FormattedInfoWithEiId
}

export function FormattedAgreementInfo({ info }: Props) {
    if (!info) {
        return (
            <Text>No data</Text>
        )
    }

    const data: AgreementInfoFormatResponse = info?.data as unknown as AgreementInfoFormatResponse

  


    return (
        <Stack gap={4}>
            <Text size="sm">{data.summary}</Text>

            <SimpleGrid cols={2} spacing="md">
                <MetadataItem header="Title" text={data.title} />
                <MetadataItem header="Effective date" text={data.effective_date} />
                <MetadataItem header="Target" text={data.target_entity} />
                <MetadataItem header="Counter party" text={data.counter_party} />
            </SimpleGrid>
        </Stack>
    )
}