import { Box, SimpleGrid, Textarea, } from "@mantine/core"
import { IndemnitiesShape, LimitationOfLiabilityShape } from "@/types/formattersTypes"

import { BoolSelect } from "../BoolSelect"
import { ItemViewProps } from "./FormattedItemList"
import { z } from "zod"

export function FormattedIndemnities({ form, index, onChange }: ItemViewProps<z.infer<typeof IndemnitiesShape>>) {

    return (
        <Box>
            <Textarea
                // label="Summary"
                {...form.getInputProps(`infos.${index}.data.summary`)}
                value={form.getInputProps(`infos.${index}.data.summary`).value ?? ""}
                autosize
            />
            <SimpleGrid cols={2} spacing="md">
                <BoolSelect
                    label="Inclusive"
                    {...form.getInputProps(`infos.${index}.data.inclusive`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.inclusive`, value)
                        onChange()
                    }}
                />
                <BoolSelect
                    label="IP infringement"
                    {...form.getInputProps(`infos.${index}.data.ipInfringe`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.ipInfringe`, value)
                        onChange()
                    }}
                />
            </SimpleGrid>

        </Box>

    )
}