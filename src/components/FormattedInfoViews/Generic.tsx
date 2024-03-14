import { Anchor, Badge, Group, Stack, Text, Title } from "@mantine/core"
import { FormatterViewProps, IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes"

import { EIReferenceLinks } from "./EIReferences"
import { FormattedInfoWithEiId } from "@/types/complex"

export function FormattedGeneric({ info }: FormatterViewProps) {

    

    const data: IFormatResponse = info?.data as unknown as IFormatResponse

    const extractedInfoRefs = info?.extracted_information?.map(ei => ei.id) ?? []


    return (
        <Stack>

            <Text style={{whiteSpace:"pre-wrap"}}>{data?.summary}</Text>
            <EIReferenceLinks ids={extractedInfoRefs} />

        </Stack>
    )
}