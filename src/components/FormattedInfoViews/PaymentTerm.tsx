import { ActionIcon, Anchor, Badge, Box, Button, Checkbox, Group, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { PaymentTermsDirection, PaymentTermsItemShape } from "@/types/formattersTypes"

import { BoolSelect } from "../BoolSelect"
import { ItemViewProps } from "./FormattedItemList"
import { z } from "zod"

export function FormattedPaymentTerms({ form, index, onChange }: ItemViewProps<z.infer<typeof PaymentTermsItemShape>>) {






    return (

        <Stack>
            <Textarea
                // label="Summary"
                {...form.getInputProps(`items.${index}.data.summary`)}
            />
            <SimpleGrid cols={2} spacing="md" style={{ alignItems: "center" }}>
                <Select
                    label="Direction"
                    {...form.getInputProps(`items.${index}.data.direction`)}
                    data={Object.keys(PaymentTermsDirection).map(k => ({ value: k, label: k.charAt(0) + k.slice(1).toLowerCase() }))}
                />



                <BoolSelect
                    label="Royalty"
                    {...form.getInputProps(`infos.${index}.data.royalty`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.royalty`, value)
                        onChange()
                    }}
                />
            </SimpleGrid>



        </Stack>
    )
}