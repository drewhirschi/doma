import { Anchor, Badge, Button, Group, Stack, Text, Textarea, Title } from "@mantine/core"

import { SourceCodeFormatResponse } from "@/types/formattersTypes"
import { ViewProps } from "./FormattedItemSingle"

export function FormattedSourceCode({ form, onChange }: ViewProps<SourceCodeFormatResponse>) {


     


  


    return (

       
            <Stack>

                <Textarea
                    label="Content"
                    {...form.getInputProps('content')}
                />
                <Textarea
                    label="Release conditions"
                    {...form.getInputProps('releaseConditions')}
                />
                <Textarea
                    label="License"
                    {...form.getInputProps('license')}
                />


            </Stack>
    )
}