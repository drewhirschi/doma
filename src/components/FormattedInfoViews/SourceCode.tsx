import { Anchor, Badge, Button, Group, Stack, Text, Textarea, Title } from "@mantine/core"

import { SourceCodeFormatResponse } from "@/types/formattersTypes"
import { ViewProps } from "./FormattedItemSingle"

export function FormattedSourceCode({ form, onChange }: ViewProps<SourceCodeFormatResponse>) {








    return (


        <Stack>

            <Textarea
                autosize
                label="Content"
                {...form.getInputProps('content')}
                value={form.getInputProps(`content`).value ?? ""}

            />
            <Textarea
                autosize
                label="Release conditions"
                {...form.getInputProps('releaseConditions')}
                value={form.getInputProps(`releaseConditions`).value ?? ""}

            />
            <Textarea
                autosize
                label="License"
                {...form.getInputProps('license')}
                value={form.getInputProps(`license`).value ?? ""}

            />


        </Stack>
    )
}