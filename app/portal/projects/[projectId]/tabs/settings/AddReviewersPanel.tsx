'use client'

import { Button, Checkbox, Drawer, Group, MantineProvider, Stack } from '@mantine/core';
import { IResp, rerm, rok } from '@/utils';

import { actionWithNotification } from '@/clientComp';
import { browserClient } from '@/supabase/BrowserClient';
import { revalidatePath } from 'next/cache';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useState } from 'react';

export function AddReviewersPanel(props: {
    project: Project_SB & { profile: Profile_SB[] }
    members: Profile_SB[]
    updateProjectAssignments: (addedIds: string[], removedIds: string[]) => Promise<IResp>
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const [saving, setSaving] = useState(false)

    const form = useForm({
        initialValues: props.members.reduce((acc: any, profile) => {
            acc[profile.id] = props.project.profile.some(p => p.id === profile.id)
            return acc
        }, {}),
    });

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Add team members" position='right'>
                <Stack gap={"xs"}>
                    <MantineProvider theme={{ cursorType: 'pointer' }}>

                        {props.members.map(profile => <Checkbox
                            key={profile.id}
                            label={profile.display_name}

                            {...form.getInputProps(profile.id, { type: 'checkbox' })}


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
                            const currentProfile = props.project.profile.map(p => p.id);
                            const formValues = Object.entries(form.values);
                            const removed = currentProfile.filter(id => !form.values[id]);
                            const added = formValues
                                .filter(([id, shouldBeAssigned]) => shouldBeAssigned && !currentProfile.includes(id))
                                .map(([id]) => id);

                            console.log({ removed, added });


                            setSaving(true)

                            const sb = browserClient();

                            await actionWithNotification(() => props.updateProjectAssignments(added, removed), { title: "Updating assignments" })
                            setSaving(false)
                            close()


                        }}>Save</Button>
                </Group >
            </Drawer>

            <Button onClick={open}>Edit reviewers</Button>
        </>
    );
}