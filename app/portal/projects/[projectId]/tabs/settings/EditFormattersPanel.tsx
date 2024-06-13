'use client';

import { Box, Button, Checkbox, Drawer, Group, Stack } from '@mantine/core';
import React, { useEffect, useState } from 'react';

import { browserClient } from '@/supabase/BrowserClient';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

interface IEditFormattersPanelProps { projectId: string; }

export default function EditFormattersPanel(props: IEditFormattersPanelProps) {
    const [state, setState] = useState("pending");
    const [opened, { open, close }] = useDisclosure(false);
    const [formatters, setFormatters] = useState<Formatter_SB[]>([])
    const [projectFormatters, setProjectFormatters] = useState<Formatter_SB[]>([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            const sb = browserClient();
            const proms = [

                sb.from('project').select('*, formatters(*)').eq('id', props.projectId).single().then(({ data, error }) => {
                    if (error) {

                        setState("error")
                        console.log(error)
                    } else if (data) {
                        setProjectFormatters(data.formatters)
                        return data.formatters
                    }
                }),
                sb.from('formatters').select('*').then(({ data, error }) => {

                    if (error) {
                        console.error(error)
                        setState("error")
                    } else if (data) {
                        setFormatters(data)
                        return data
                    }
                })

            ]


            const res = await Promise.all(proms)

            setState("success")
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

                    {formatters.map(formatter => <Checkbox
                        key={formatter.key}
                        label={formatter.display_name}
                        checked={projectFormatters.some(pf => pf.key == formatter.key)}
                        onChange={(event) => {

                            if (event.currentTarget.checked) {
                                setProjectFormatters([...projectFormatters, formatter])
                            } else {
                                setProjectFormatters(projectFormatters.filter(pf => pf.key != formatter.key))
                            }
                        }}
                    />)}
                </Stack>
                <Group
                    justify="flex-end"
                >

                    <Button loading={saving} onClick={async () => {
                        try {
                            setSaving(true)
                            const sb = browserClient();
                            const remove = await sb.from("project_formatters").delete().eq("project_id", props.projectId).throwOnError()
                            const insert = await sb.from("project_formatters").insert(projectFormatters.map(pf => ({ project_id: props.projectId, formatter_key: pf.key }))).throwOnError()
                            setSaving(false)
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
            </Box>
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