"use client"

import { Box, Button, Group, Modal, MultiSelect, Select, TagsInput, TextInput, rem } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { useEffect, useState } from 'react';

import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { LoadingState } from '@/types/loadingstate';
import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { createProject } from './actions';
import { useDisclosure } from '@mantine/hooks';

interface Props {
}


export function AddProjectModal(props: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const [createLoading, setCreateLoading] = useState<LoadingState>(LoadingState.IDLE)





    const form = useForm({
        initialValues: {
            title: '',
        },
    });



    return (
        <>
            <Modal opened={opened} onClose={() => {
                close()
                form.reset()
            }} title="New Project" closeOnClickOutside={false}>

                <Box maw={400} mx="auto" >
                    <TextInput label="Project Name" placeholder="Project name" withAsterisk {...form.getInputProps('title')} />





                    <Group justify="flex-end" mt="md">
                        <Button
                            loading={createLoading == LoadingState.LOADING} onClick={() => {
                                const values = form.values
                                setCreateLoading(LoadingState.LOADING)

                                createProject(values.title).then(() => {
                                    setCreateLoading(LoadingState.LOADED)
                                    close()
                                    form.reset()
                                }).catch((e) => {
                                    setCreateLoading(LoadingState.ERROR)
                                })
                            }}>Create</Button>
                    </Group>
                </Box>


            </Modal>

            <Button onClick={open}>New</Button>
        </>
    );
}