import { Box, Select, SimpleGrid, Textarea, } from "@mantine/core"
import { PaymentTermsDirection, WarrantyShape } from "@/types/formattersTypes"

import { BoolSelect } from "../BoolSelect"
import { ItemViewProps } from "./FormattedItemList"
import { z } from "zod"

export function FormattedWarranty({ form, index, onChange }: ItemViewProps<z.infer<typeof WarrantyShape>>) {

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
                    label="No waiver"
                    {...form.getInputProps(`infos.${index}.data.noWaiver`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.noWaiver`, value)
                        onChange()
                    }}
                    />
                <Select label="Direction"
                    data={Object.keys(PaymentTermsDirection)}
                    {...form.getInputProps(`infos.${index}.data.direction`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.direction`, value)
                        onChange()
                    }}
                />
            </SimpleGrid>

        </Box>

    )
}