import { AgreementInfoFormatResponse, TermFormatResponse, } from "@/types/formattersTypes"
import { Anchor, Badge, Button, Group, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { useEffect, useState } from "react"

import { AnnotationsList } from "./AnnotationsList"
import { DatePickerInput } from "@mantine/dates"
import { ViewProps } from "./FormattedItemView"
import { notifications } from "@mantine/notifications"
import { useForm } from '@mantine/form';

function strToNullableBool(str: string | null) {
    if (str === "true") return true
    if (str === "false") return false
    return null
}

export function FormattedTerm({ form, onChange }: ViewProps<TermFormatResponse>) {


    return (
        <Stack gap={4}>
            <Textarea autosize {...form.getInputProps('summary')} />


            <SimpleGrid cols={2} spacing="md">
                <DatePickerInput
                    label="Expire date"
                    placeholder="N/A"
                    clearable
                    firstDayOfWeek={0}
                    {...form.getInputProps('expireDate')}
                    value={form.values.expireDate ? new Date(form.values.expireDate) : null}
                    onChange={(value) => {
                        form.setFieldValue('expireDate', value)
                        onChange()
                    }}
                />
                <Select
                    label="Expired"
                    placeholder="N/A"
                    {...form.getInputProps('expired')}
                    onChange={(value) => {
                        form.setFieldValue('expired', strToNullableBool(value))
                        onChange()
                    }}
                    clearable
                    data={[{ label: "Yes", value: 'true' }, { label: "No", value: 'false' },]}
                />
                <Select
                    label="Silent"
                    placeholder="N/A"
                    {...form.getInputProps('silent')}
                    onChange={(value) => {
                        form.setFieldValue('silent', strToNullableBool(value))
                        onChange()
                    }}
                    clearable
                    data={[{ label: "Yes", value: 'true' }, { label: "No", value: 'false' },]}
                />
            </SimpleGrid>

        </Stack>

    )
}