import { ActionIcon, Anchor, Badge, Box, Button, Checkbox, Group, MultiSelect, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { FormatterViewProps, LicenseDirection, LicenseFormatResponse, LicenseSuffix, TerminationFormatResponse, TerminationTag } from "@/types/formattersTypes"

import { IconTrash } from "@tabler/icons-react";
import MetadataItem from "../MetadataItem"
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useState } from "react";

export function FormattedLicense({ info, handleSave }: FormatterViewProps) {
    const data = info?.data as unknown as LicenseFormatResponse | undefined
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
                    <Box key={"license" + i.toString()} p="sm"
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
                        <Textarea name="summary"
                            {...form.getInputProps(`items.${i}.summary`)}
                        />
                        <Checkbox
                        mt={"sm"}
                        label="Exclusive"
                            {...form.getInputProps(`items.${i}.exclusive`, { type: "checkbox" })}
                        />
                        <SimpleGrid cols={2} spacing="md">
                            <Select label="Type"
                                data={Object.keys(LicenseSuffix)}
                                {...form.getInputProps(`items.${i}.type`)}
                            />
                            <Select label="Direction"
                                data={Object.keys(LicenseDirection)}
                                {...form.getInputProps(`items.${i}.direction`)}
                            />
                            {/* <Select label="Exclusive"
                                data={['Yes', "No"]}
                                {...form.getInputProps(`items.${i}.exclusive`)}
                            /> */}
                        </SimpleGrid>
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