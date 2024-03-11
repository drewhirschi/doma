import { AgreementInfoFormatResponse, TermFormatResponse, TerminationFormatResponse } from "@/types/formattersTypes"
import { Anchor, Badge, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core"

import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"

interface Props {
    
    info?: FormattedInfoWithEiId
}

export function FormattedTerm({ info }: Props) {
    if (!info) {
        return (
            <Text>No data</Text>
        )
    }

    const data: TermFormatResponse = info?.data as unknown as TermFormatResponse

  


    return (
        <Stack gap={4}>
            <Text size="sm">{data.summary}</Text>

            <SimpleGrid cols={2} spacing="md">
                <MetadataItem header="Expire date" text={data?.expireDate ? new Date(data.expireDate).toLocaleDateString() : "No Date"} />
                <MetadataItem header="Expired" text={data?.expired ? "Yes" : "No"} />
                <MetadataItem header="Silent" text={data?.silent ? "Yes" : "No"} />
                
            </SimpleGrid>
        </Stack>
    )
}