import { AgreementInfoFormatResponse, FormatterViewProps, TermFormatResponse, TerminationFormatResponse } from "@/types/formattersTypes"
import { Anchor, Badge, Button, Group, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"

import { DatePickerInput } from "@mantine/dates"
import { EIReferenceLinks } from "./EIReferences"
import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"
import { notifications } from "@mantine/notifications"
import { useForm } from '@mantine/form';
import { useState } from "react"

function strToNullableBool(str: string | null | undefined) {
    if (str === "true") return true
    if (str === "false") return false
    return null
}

export function FormattedTerm({ info, handleSave }: FormatterViewProps) {


    const data = info?.data as unknown as TermFormatResponse | undefined
    const form = useForm({
        initialValues: {
            summary: data?.summary,
            expireDate: data?.expireDate ? new Date(data.expireDate) : null,
            expired: data?.expired?.toString(),
            silent: data?.silent?.toString(),


        },
    });
    const [loading, setLoading] = useState(false);



    return (
        <form onSubmit={form.onSubmit(async (values) => {
            setLoading(true)
            try {

                let updateValues = { ...values, expired: strToNullableBool(values.expired), silent: strToNullableBool(values.silent) }
                await handleSave(updateValues)
                form.resetDirty()
            } catch (e) {
                console.error(e)
                notifications.show({
                    title: "Failed to save",
                    message: "An error occurred while saving the data",
                    color: "red"
                })
            }
            setLoading(false)
        })}>

            <Stack gap={4}>
                <Textarea autosize {...form.getInputProps('summary')} />
                <EIReferenceLinks ids={info?.extracted_information?.map(ei => ei.id) ?? []} />


                <SimpleGrid cols={2} spacing="md">
                    <DatePickerInput
                        label="Expire date"
                        placeholder="N/A"
                        clearable
                        firstDayOfWeek={0}
                        {...form.getInputProps('expireDate')}
                    />
                    <Select
                        label="Expired"
                        placeholder="N/A"
                        {...form.getInputProps('expired')}
                        clearable
                        data={[{ label: "Yes", value: 'true' }, { label: "No", value: 'false' },]}
                    />
                    <Select
                        label="Silent"
                        placeholder="N/A"
                        {...form.getInputProps('silent')}
                        clearable
                        data={[{ label: "Yes", value: 'true' }, { label: "No", value: 'false' },]}
                    />
                </SimpleGrid>
                <Button loading={loading} size="xs" style={{ alignSelf: "flex-end" }} mt={"sm"} type="submit" disabled={!form.isDirty() || loading} color="blue">Save</Button>

            </Stack>
        </form>
    )
}