import { Box, SimpleGrid, Textarea, } from "@mantine/core"
import { GoverningLawShape, IndemnitiesShape, LimitationOfLiabilityShape } from "@/types/formattersTypes"

import { BoolSelect } from "../BoolSelect"
import { ItemViewProps } from "./FormattedItemList"
import { z } from "zod"

export function FormattedGoverningLaw({ form, index, onChange }: ItemViewProps<z.infer<typeof GoverningLawShape>>) {

    return (
        <Box>
            <Textarea
                label="Jurisdiction"
                {...form.getInputProps(`infos.${index}.data.jurisdiction`)}
                value={form.getInputProps(`infos.${index}.data.jurisdiction`).value ?? ""}
                autosize
            />
            {!!form.getInputProps(`infos.${index}.data.condition`).value &&
                <Textarea
                    // label="Summary"
                    {...form.getInputProps(`infos.${index}.data.condition`)}
                    value={form.getInputProps(`infos.${index}.data.condition`).value ?? ""}
                    autosize
                />}


        </Box>

    )
}