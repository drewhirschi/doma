import { Box, Textarea } from "@mantine/core"

import { GenericFormatResponseShape } from "@/types/formattersTypes"
import { ItemViewProps } from "./FormattedItemList"
import { z } from "zod"

export function FormattedSummaryList({ form, index, onChange }: ItemViewProps<z.infer<typeof GenericFormatResponseShape>>) {

    return (
        <Box>
            <Textarea
                autosize
                {...form.getInputProps(`items.${index}.data.summary`)}
                value={form.getInputProps(`infos.${index}.data.summary`).value ?? ""}
                onChange={(e) => {
                    form.setFieldValue(`infos.${index}.data.summary`, e.currentTarget.value)
                    onChange()
                }}

            />
        </Box>
    )
}