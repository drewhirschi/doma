import { Anchor, Badge, Group, Select, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core"

import { AgreementInfoFormatResponse } from "@/types/formattersTypes"
import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"

interface Props {
    // data: AgreementInfoFormatResponse
    // extractedInfoRefs: string[]
    info?: FormattedInfoWithEiId
}

export function FormattedAgreementInfo({ info }: Props) {


    const data: AgreementInfoFormatResponse = info?.data as unknown as AgreementInfoFormatResponse


    return (
        <Stack gap={4}>
            <Text size="sm">{data.summary}</Text>

            <SimpleGrid cols={2} spacing="md">
                <TextInput label="Title" value={data.title}/>
                <TextInput label="Effective date" value={data.effective_date}/>
                <TextInput label="Target" value={data.target_entity}/>
                <TextInput label="Counter party" value={data.counter_party}/>
            </SimpleGrid>
        </Stack>
    )
}