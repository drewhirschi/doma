'use client';

import { Box, Button, Checkbox, Drawer, Group, MantineProvider, Stack } from '@mantine/core';
import React, { useEffect, useState } from 'react';

import { browserClient } from '@/supabase/BrowserClient';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

interface IEditFormattersPanelProps { projectId: string; }

export default function EditFormattersPanel(props: IEditFormattersPanelProps) {
    const [state, setState] = useState("pending");
    const [opened, { open, close }] = useDisclosure(false);
    const [formatters, setFormatters] = useState<Formatter_SB[]>([])
    const [saving, setSaving] = useState(false)

    const form = useForm({
        initialValues: {
        },
    });

    useEffect(() => {
        const loadData = async () => {
            const sb = browserClient();
            try {
                const proms = [
                    sb.from('project').select('*, formatters(*)').eq('id', props.projectId).single().throwOnError(),
                    sb.from('formatters').select('*').order('priority').throwOnError()
                ]


                const [projectFormattersq, formattersq] = await Promise.all(proms)

                if (projectFormattersq.error || formattersq.error) {
                    setState("error")
                    return
                }

                //@ts-ignore
                const projectFormatters: Formatter_SB[] = projectFormattersq.data.formatters as Formatter_SB[]
                const allFormatters: Formatter_SB[] = formattersq.data as Formatter_SB[]
                setFormatters(allFormatters)

                const initValues = allFormatters.reduce((acc: any, formatter) => {
                    acc[formatter.key] = projectFormatters.some(pf => pf.key === formatter.key);
                    return acc;
                }, {})

                form.setInitialValues(initValues)
                form.setValues(initValues)

                setState("success")
            } catch (error) {
                setState("error")
            }

        }


        loadData()

    }, []);



    const panelBody = () => {
        if (state === "pending") {
            return <div>Loading...</div>
        } else if (state === "error") {
            return <div>Error</div>
        }



        return (
            <Box>
                <Stack gap={"xs"}>
                    <MantineProvider theme={{ cursorType: 'pointer' }}>

                        {formatters.map(formatter => <Checkbox
                            key={formatter.key}
                            label={formatter.display_name}

                            {...form.getInputProps(formatter.key, { type: 'checkbox' })}


                        />)}
                    </MantineProvider>
                </Stack>
                <Group
                    justify="flex-end"
                >

                    <Button
                        disabled={!form.isDirty()}
                        loading={saving}
                        onClick={async () => {
                            try {
                                setSaving(true)
                                const sb = browserClient();
                                console.log(form.values)
                                const remove = await sb.from("project_formatters").delete().eq("project_id", props.projectId).throwOnError()

                                const itemsToInsert = Object.entries(form.values)
                                    .filter(([key, value]) => value === true)
                                    .map(([key]) => ({ project_id: props.projectId, formatter_key: key }))

                                const insert = await sb.from("project_formatters").insert(itemsToInsert).throwOnError()
                                setSaving(false)
                                form.resetDirty()
                            } catch (error) {
                                console.log(error)
                                notifications.show({
                                    title: "Error",
                                    message: JSON.stringify(error),
                                    color: "red"
                                })
                            }
                        }}>Save</Button>
                </Group >
            </Box >
        )

    }

    return (
        <>
            <Drawer opened={opened} position='right' size={"lg"} onClose={close} title="Edit Formatters">

                {panelBody()}
            </Drawer>

            <Button onClick={open}>Edit formatters</Button>
        </>
    );
}