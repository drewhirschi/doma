import { Anchor, Badge, Group, Stack, Text, Title } from "@mantine/core"
import { IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes"

import { EIReferenceLinks } from "./EIReferences"
import { FormattedInfoWithEiId } from "@/types/complex"

interface Props {
    info: FormattedInfoWithEiId
}

export function FormattedGeneric({ info }: Props) {

    

    const data: IFormatResponse = info?.data as unknown as IFormatResponse

    const extractedInfoRefs = info?.extracted_information?.map(ei => ei.id) ?? []


    return (
        <Stack>

            <Text style={{whiteSpace:"pre-wrap"}}>{data?.summary}</Text>
            <EIReferenceLinks ids={extractedInfoRefs} />

        </Stack>
    )
}