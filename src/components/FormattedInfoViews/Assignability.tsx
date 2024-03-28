import { AgreementInfoFormatResponse, AssignabilitySuffix, AssignabilityType, FormatterViewProps, TermFormatResponse, TerminationFormatResponse } from "@/types/formattersTypes"
import { Anchor, Badge, Button, Group, MultiSelect, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"

import { DatePickerInput } from "@mantine/dates"
import MetadataItem from "../MetadataItem"
import { notifications } from "@mantine/notifications"
import { useForm } from '@mantine/form';
import { useState } from "react"

export function FormattedAssignability({ info, handleSave, annotations, removeAnnotation  }: FormatterViewProps) {


    const data = info.map(i => i.data) as TermFormatResponse[]
    const form = useForm({
        initialValues: data,
    });
    const [loading, setLoading] = useState(false);



    return (
        <form onSubmit={form.onSubmit(async (values) => {
            setLoading(true)
            try {

                await handleSave(values)
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
                <Textarea {...form.getInputProps('summary')} />


                <SimpleGrid cols={2} spacing="md">
                    
                    <Select
                        label="Type"
                        placeholder="N/A"
                        {...form.getInputProps('type')}
                        clearable
                        data={Object.keys(AssignabilityType)}
                    />
                    <MultiSelect
                        label="Tags"
                        // placeholder="N/A"
                        {...form.getInputProps('suffix')}
                        clearable
                        data={Object.keys(AssignabilitySuffix)}
                    />
                </SimpleGrid>
                <Button loading={loading} size="xs" style={{ alignSelf: "flex-end" }} mt={"sm"} type="submit" disabled={!form.isDirty() || loading} color="blue">Save</Button>

            </Stack>
        </form>
    )
}