import { ActionIcon, Anchor, Badge, Box, Button, Group, Select, Stack, Text, Textarea, Title } from "@mantine/core"
import { FormatterViewProps, TerminationFormatResponse, TerminationTag } from "@/types/formattersTypes"

import { IconTrash } from "@tabler/icons-react";
import MetadataItem from "../MetadataItem"
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useState } from "react";

export function FormattedTermination({ info, handleSave }: FormatterViewProps) {
    const data = info?.data as unknown as TerminationFormatResponse | undefined
    const form = useForm({
        initialValues: {
            items: data?.items ?? []
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

            <Stack gap={"lg"}>
                {form.values?.items?.map((d, i) => (
                    <Box key={"termination" + i.toString()} p="sm"
                    // style={{ border: "solid 1px" }}
                    >
                        <Group justify="space-between">
                            <Title order={4}>Item {i + 1}</Title>
                            <ActionIcon variant="subtle" color="gray" onClick={() => {

                                form.removeListItem("items", i)
                            }}>

                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                            </ActionIcon>
                        </Group>
                        <Textarea autosize name="summary"
                            {...form.getInputProps(`items.${i}.summary`)}
                        />
                        <Select label="Type"
                            {...form.getInputProps(`items.${i}.tag`)}
                            data={[
                                { value: TerminationTag.CONVENIENCE, label: "Convenience" },
                                { value: TerminationTag.CHANGE_OF_CONTROL_TERMINATION, label: "Change of control termination" },
                                { value: TerminationTag.TERMINATED, label: "Terminated" }
                            ]} />
                    </Box>

                )) ?? []}
                <Group justify="flex-end">

                    <Button size="xs" variant="default" onClick={() => {
                        form.insertListItem('items', { summary: "", tag: null });

                    }}>Add</Button>
                    <Button loading={loading} size="xs" type="submit" disabled={!form.isDirty() || loading} color="blue">Save</Button>
                </Group>

            </Stack>
        </form>
    )
}