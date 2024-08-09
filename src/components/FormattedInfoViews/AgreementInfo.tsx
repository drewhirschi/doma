import { Anchor, Badge, Button, Input, SimpleGrid, Stack, TagsInput, Text, TextInput, Textarea, Title } from "@mantine/core"

import { AgreementInfoFormatResponse } from "@/types/formattersTypes"
import { DatePickerInput } from "@mantine/dates";
import { ViewProps } from "./FormattedItemSingle";

export function FormattedAgreementInfo({ form, afterChange }: ViewProps<AgreementInfoFormatResponse>) {

   

    return (

        <Stack gap={4}>
            <Textarea
                autosize
                {...form.getInputProps('summary')}
                value={form.getInputProps(`summary`).value ?? ""}
            // value={data.summary ?? ""}
            // onChange={(e) => {
            //     // form.setFieldValue('summary', e.currentTarget.value)
            //     setData({ ...data, summary: e.currentTarget.value })
            //     // onChange()
            // }}

            />

            <SimpleGrid cols={2} spacing="md">
                <TextInput
                    label="Title"
                    {...form.getInputProps('title')}
                    value={form.getInputProps(`title`).value ?? ""}

                />
                {/* <DatePickerInput
                    firstDayOfWeek={0}
                    label="Effective date"
                    placeholder="No date"
                    clearable
                    {...form.getInputProps('effective_date')}
                    value={effectiveDate}
                    onChange={(value) => {
                        if (value != null) {
                            form.setFieldValue('effective_date', value.toISOString())
                            afterChange()
                        }
                    }}
                /> */}
                <Input.Wrapper
                    label="Effective date"
                    placeholder="No date"
                >

                    <Input
                        {...form.getInputProps('effective_date')}
                        type="date"
                        value={form.values.effective_date ?? undefined}
                        onChange={(e) => {
                            form.setFieldValue('effective_date', e.currentTarget.value)
                            afterChange()
                            console.log(e.currentTarget.value)
                        }} />
                </Input.Wrapper>
                <TextInput
                    label="Target"
                    {...form.getInputProps('target_entity')}
                    value={form.getInputProps(`target_entity`).value ?? ""}
                />
                <TagsInput
                    label="Target aliases"
                    {...form.getInputProps("alternate_target_entity_names")}
                    onChange={(values: string[]) => {
                        form.setFieldValue("alternate_target_entity_names", values)
                        afterChange()
                    }}
                    value={form.getInputProps(`alternate_target_entity_names`).value ?? []}
                />
                <TextInput
                    label="Counterparty"
                    {...form.getInputProps("counter_party")}
                    value={form.getInputProps(`counter_party`).value ?? ""}
                />
                <TagsInput
                    label="Counterparty aliases"
                    {...form.getInputProps("alternate_counter_party_names")}
                    onChange={(values: string[]) => {
                        form.setFieldValue("alternate_counter_party_names", values)
                        afterChange()
                    }}
                    value={form.getInputProps(`alternate_counter_party_names`).value ?? []}
                />

            </SimpleGrid>
            <TagsInput
                label="Incorporated agreements"
                {...form.getInputProps("incorporatedAgreements")}
                onChange={(values: string[]) => {
                    form.setFieldValue("incorporatedAgreements", values)
                    afterChange()
                }}
                value={form.getInputProps(`incorporatedAgreements`).value ?? []}
            />

        </Stack>


    )
}