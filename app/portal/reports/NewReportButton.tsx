"use client"

import { Button, Group, Modal, TextInput } from '@mantine/core';

import { IconPlus } from '@tabler/icons-react';
import { title } from 'process';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

interface Props {
    onCreateReport: (title: string, industry: string) => Promise<void>;
}
export function NewReportButton({ onCreateReport }: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const form = useForm({
        initialValues: {
            industry: '',
            title: '',
        },

        validate: {
            title: (value) => (value.length > 0 ? null : 'Title is required'),
            industry: (value) => (value.length > 0 ? null : 'Industry is required'),
        },

    });



    return (
        <>
            <Modal opened={opened} onClose={close} title="New Report">
                <form onSubmit={form.onSubmit(async (values) => {
                    try {

                        await onCreateReport(values.title, values.industry)
                    } catch (error) {
                        console.log(error)
                    }
                    form.reset()
                    close()
                })}>
                    <TextInput
                        withAsterisk
                        label="Title"
                        placeholder="2023 Aerospace Trends"
                        {...form.getInputProps('title')}
                    />
                    <TextInput
                        withAsterisk
                        label="Industry"
                        placeholder="Aerospace"
                        {...form.getInputProps('industry')}
                    />



                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </Modal>

            <Button rightSection={<IconPlus />}
                onClick={open}
            >New</Button>
        </>
    );
}