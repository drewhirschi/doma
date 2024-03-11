import { Anchor, Badge, Group, Stack, Text, Title } from "@mantine/core"
import { FormatterViewProps, IFormatResponse, PaymentTermsFormatResponse } from "@/types/formattersTypes"

import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"

export function FormattedTrojans({ info }: FormatterViewProps) {

    

    const data = info?.data as unknown as IFormatResponse | undefined

    // const extractedInfoRefs = info.extracted_information.map(ei => ei.id)


    return (
        <Stack>

            <Text>{data?.summary}</Text>
            {/* <MetadataItem header="Direction" text={data.direction}/> */}

            {/* <Group gap={2}>

                {extractedInfoRefs.map((id, index) => (
                    <Anchor key={id} href={`#${id}`}>[{index + 1}]</Anchor>
                ))}
            </Group> */}

        </Stack>
    )
}