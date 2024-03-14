import { ActionIcon, Anchor, Badge, Box, Button, Checkbox, Group, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { FormatterViewProps, IPOwnershipFormatResponse, IpOwnershipType, PaymentTermsDirection } from "@/types/formattersTypes"

import { EIReferenceLinks } from "./EIReferences"
import { FormattedInfoWithEiId } from "@/types/complex"
import { IconTrash } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { useForm } from "@mantine/form"
import { useState } from "react"

export function FormattedPaymentTerms({ info, handleSave }: FormatterViewProps) {




    const data = info?.data as unknown as IPOwnershipFormatResponse | undefined


    const extractedInfoRefs = info?.extracted_information?.map(ei => ei.id) ?? []
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
            <Stack>
                {form.values?.items?.map((d, i) => (
                    <Box p="sm"
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
                        <Textarea
                            // label="Summary"
                            {...form.getInputProps(`items.${i}.summary`)}
                        />
                        <SimpleGrid cols={2} spacing="md">
                            <Select
                                label="Direction"
                                {...form.getInputProps(`items.${i}.direction`)}
                                data={Object.keys(PaymentTermsDirection).map(k => ({ value: k, label: k.charAt(0) + k.slice(1).toLowerCase() }))}
                            />


                        </SimpleGrid>
                        <SimpleGrid cols={2} spacing="md" mt={"sm"}>

                            <Checkbox
                                label="Royalty"
                                {...form.getInputProps(`items.${i}.royalty`, { type: "checkbox" })}
                            />
                           

                        </SimpleGrid>
                    </Box>

                )) ?? []}

                <EIReferenceLinks ids={extractedInfoRefs} />

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