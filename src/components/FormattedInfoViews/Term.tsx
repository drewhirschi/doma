import { AgreementInfoFormatResponse, TermFormatResponse, } from "@/types/formattersTypes"
import { Anchor, Badge, Button, Group, InputVariant, MantineComponent, Select, SelectProps, SelectStylesNames, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { useEffect, useState } from "react"

import { AnnotationsList } from "./AnnotationsList"
import { BoolSelect } from "../BoolSelect"
import { DatePickerInput } from "@mantine/dates"
import { ViewProps } from "./FormattedItemSingle"
import { notifications } from "@mantine/notifications"
import { useForm } from '@mantine/form';

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
                <BoolSelect
                    label="Expired"
                    {...form.getInputProps('expired')}
                    onChange={(value) => {
                        form.setFieldValue('expired', value )
                        onChange()
                    }}

                />
              
                <BoolSelect
                    label="Silent"
                    {...form.getInputProps('silent')}
                    onChange={(value) => {
                        form.setFieldValue('silent', value )
                        onChange()
                    }}
                   
                />
            </SimpleGrid>

        </Stack>

    )
}