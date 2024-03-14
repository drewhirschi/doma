import { AgreementInfoFormatResponse, FormatterViewProps } from "@/types/formattersTypes"
import { Anchor, Badge, Button, Group, Select, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from "@mantine/core"

import { DatePickerInput } from "@mantine/dates";
import { FormattedInfoWithEiId } from "@/types/complex"
import MetadataItem from "../MetadataItem"
import { notifications } from "@mantine/notifications";
import { useForm } from '@mantine/form';
import { useState } from "react";

export function FormattedAgreementInfo({ info, handleSave }: FormatterViewProps) {
    const data = info?.data as unknown as AgreementInfoFormatResponse | undefined
    const form = useForm({
        initialValues: {
            summary: data?.summary,
            title: data?.title,
            effective_date: data?.effective_date ? new Date(data?.effective_date) : null,
            target_entity: data?.target_entity,
            counter_party: data?.counter_party,
        },
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
                <Textarea {...form.getInputProps('summary')}/>

                <SimpleGrid cols={2} spacing="md">
                    <TextInput label="Title" {...form.getInputProps('title')}/>
                    <DatePickerInput
                    firstDayOfWeek={0}
                        label="Effective date"
                        placeholder="No date"
                        clearable
                        {...form.getInputProps('effective_date')}                        
                    />
                    <TextInput label="Target" {...form.getInputProps('target_entity')} />
                    <TextInput label="Counterparty" {...form.getInputProps("counter_party")} />
                </SimpleGrid>
                <Button loading={loading} size="xs" style={{alignSelf: "flex-end"}} mt={"sm"} type="submit" disabled={!form.isDirty() || loading} color="blue">Save</Button>
            </Stack>
        </form>
    )
}