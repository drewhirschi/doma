"use client"

import { Button, CloseButton, Drawer, FileButton, Group, Modal, Radio, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconFileAnalytics, IconPlus } from '@tabler/icons-react';

import { Database } from '@/shared/types/supabase';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

interface Props {
    onCreateReport: (title: string, industry: string, templateId?: number) => Promise<void>;
    templates: Database['public']['Tables']['report_templates']['Row'][]
}


export function NewTemplateButton({ onCreateReport, templates }: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const form = useForm({
        initialValues: {

            importData: 'full',
            aiModel: 'gpt-4o'
        },

        validate: {

        },

    });



    return (
        <>
            <Drawer opened={opened} onClose={close} title="New Template" size={"lg"} position={"right"} >
                <form onSubmit={form.onSubmit(async (values) => {
                    try {

                        // await onCreateReport(values.title, values.industry, (values.template > -1 ? values.template : undefined))
                    } catch (error) {
                        console.log(error)
                    }
                    form.reset()
                    close()
                })}>
                    <Stack>

                        <Radio.Group
                            name="data"
                            label="Import data"

                            {...form.getInputProps('importData',)}
                        >
                            <Group mt="xs">
                                <Radio value="full" label="Full Profile" checked />
                                <Radio value="serducts" label="Products/Services" />
                            </Group>
                        </Radio.Group>
                        <Select
                            label="Model"
                            // placeholder="Pick value"
                            data={['gpt-4o-mini', 'gpt-4o']}
                            {...form.getInputProps('aiModel')}
                        />
                    </Stack>



                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Create</Button>
                    </Group>
                </form>
            </Drawer>

            <Button rightSection={<IconPlus />}
                onClick={open}
            >New</Button>
        </>
    );
}