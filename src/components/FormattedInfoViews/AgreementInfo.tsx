import { Anchor, Badge, Button, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from "@mantine/core"

import { AgreementInfoFormatResponse } from "@/types/formattersTypes"
import { DatePickerInput } from "@mantine/dates";
import { ViewProps } from "./FormattedItemSingle";

export function FormattedAgreementInfo({ form, onChange }: ViewProps<AgreementInfoFormatResponse>) {
    



    return (
     
                <Stack gap={4}>
                    <Textarea 
                    autosize
                     {...form.getInputProps('summary')} 
                     value={form.getInputProps(`summary`).value ?? ""}

                     />

                    <SimpleGrid cols={2} spacing="md">
                        <TextInput label="Title" {...form.getInputProps('title')} />
                        <DatePickerInput
                            firstDayOfWeek={0}
                            label="Effective date"
                            placeholder="No date"
                            clearable
                            {...form.getInputProps('effective_date')}
                            value={form.values.effective_date ? new Date(form.values.effective_date) : null}
                            onChange={(value) => {
                                form.setFieldValue('effective_date', value)
                                onChange()
                            }}
                        />
                        <TextInput label="Target" {...form.getInputProps('target_entity')} />
                        <TextInput label="Counterparty" {...form.getInputProps("counter_party")} />
                    </SimpleGrid>

                </Stack>
         

    )
}