import { Anchor, Badge, Group, Stack, Text, Title } from "@mantine/core"

import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"
import { PaymentTermsFormatResponse } from "@/types/formattersTypes"

interface Props {
    info: FormattedInfoWithEiId
}

export function FormattedPaymentTerms({ info }: Props) {

    if (!info) {
        return <Text>No data</Text>
    }

    const data: PaymentTermsFormatResponse = info.data as unknown as PaymentTermsFormatResponse

    const extractedInfoRefs = info.extracted_information.map(ei => ei.id)


    return (
        <Stack>

            <Text>{data.summary}</Text>
            <MetadataItem header="Direction" text={data.direction}/>

            <Group gap={2}>

                {extractedInfoRefs.map((id, index) => (
                    <Anchor key={id} href={`#${id}`}>[{index + 1}]</Anchor>
                ))}
            </Group>

        </Stack>
    )
}