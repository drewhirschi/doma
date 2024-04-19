import { Box, SimpleGrid, Textarea, } from "@mantine/core"

import { BoolSelect } from "../BoolSelect"
import { ItemViewProps } from "./FormattedItemList"
import { LimitationOfLiabilityShape } from "@/types/formattersTypes"
import { z } from "zod"

export function FormattedLimitationOfLiability({ form, index, onChange }: ItemViewProps<z.infer<typeof LimitationOfLiabilityShape>>) {

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
                    label="Feedback"
                    {...form.getInputProps(`infos.${index}.data.noWaiver`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.noWaiver`, value)
                        onChange()
                    }}
                />
            </SimpleGrid>

        </Box>

    )
}