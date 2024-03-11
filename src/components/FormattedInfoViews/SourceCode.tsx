import { Anchor, Badge, Group, Stack, Text, Title } from "@mantine/core"
import { IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes"

import { EIReferenceLinks } from "./EIReferences"
import { FormattedInfoWithEiId } from "@/types/complex"

interface Props {
    info: FormattedInfoWithEiId
}

export function FormattedSourceCode({ info }: Props) {

    
    const data = info?.data as unknown as IFormatResponse | undefined

    const extractedInfoRefs = info?.extracted_information?.map(ei => ei.id) ?? []


    return (
        <Stack>
            
            <Text>{data?.summary}</Text>
            <EIReferenceLinks ids={extractedInfoRefs} />


        </Stack>
    )
}