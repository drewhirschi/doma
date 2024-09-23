"use client"

import { ActionIcon, Box, Button, Container, Group, Paper, Stack, TextInput } from '@mantine/core';
import { BubbleMenu, EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import { queueCompanyProfiling, queueFindIndustryCompanies, queueFindIndustyActivity, setModelCompany } from './actions';

import { IconTrash } from '@tabler/icons-react';
import { Markdown } from 'tiptap-markdown';
import MetadataItem from '@/ux/components/MetadataItem';
import Placeholder from '@tiptap/extension-placeholder';
import { ProjectWithModelCmp } from '../types';
import React from 'react';
import { SetTargetPanel } from './SetTargetPanel';
import StarterKit from '@tiptap/starter-kit';
import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { serverClient } from '@/shared/supabase-client/ServerClients';
import { useDebouncedCallback } from 'use-debounce';
import { useForm } from '@mantine/form';

const extensions = [StarterKit,
    Placeholder.configure({
        placeholder: 'Write something... Or type / to use commands',
        showOnlyWhenEditable: true
    }),
    Markdown,

]

export default function OverviewTab({
    project
}: {
    project: ProjectWithModelCmp
}) {

    const form = useForm({
        initialValues: {
            url: "",
        }
    })

    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        content: project.model_cmp?.web_summary || "",
        onUpdate: ({ editor }) => {
            debouncedSaveContent(editor.getHTML())
        }
    })

    const sb = browserClient()

    const debouncedSaveContent = useDebouncedCallback(async (content: string) => {
        if (!project.model_cmp) return
        const update = await sb.from('company_profile').update({ web_summary: content }).eq('id', project.model_cmp.id!).select().single()
        if (update.error) {
            console.log(update.error)
        }
    }, 300)


    return (
        <Group align='flex-start' m={"sm"}>
            <Stack>

                <Paper
                    radius={8}
                    withBorder
                    p={"xs"}
                >
                    <Group>
                        {project.model_cmp ? <MetadataItem header={"Model Company"} text={project.model_cmp?.name ?? "Not set"} />

                            : <SetTargetPanel setCmpId={(id: number) => setModelCompany(id, project.id)} />
                        }

                    </Group>

                  

                    <Box my={"xs"}>

                        <Button disabled={project.model_cmp == null} onClick={() => {
                            queueFindIndustryCompanies(project.model_cmp!.id)
                        }}>Find companies</Button>
                        <Button disabled={project.model_cmp == null} onClick={() => {
                            queueFindIndustyActivity(project.model_cmp!.id)
                        }}>Find Transactions</Button>
                    </Box>
                </Paper>
                <Paper
                    radius={8}
                    withBorder
                    p={"xs"}
                >

                    <Box maw={600}>
                        <Group w={600} align='flex-end' justify='space-between'>

                            <TextInput
                                flex={1}
                                label="Profile a company"
                                placeholder="Enter a url"
                                {...form.getInputProps('url')}
                            />
                            <Button onClick={async () => {
                                try {

                                    await queueCompanyProfiling(form.values.url)
                                    form.reset()
                                } catch (error) {

                                }
                            }}>Profile</Button>
                        </Group>
                    </Box>
                </Paper>
            </Stack>
            <Paper
                // m={"sm"}
                flex={1}
                radius={8}
                withBorder
                p={"xs"}
            >
                <EditorContent editor={editor} />

                <FloatingMenu editor={editor} tippyOptions={{ placement: 'bottom-start' }} shouldShow={(props) => {
                    const { selection } = props.editor.state;
                    const { $from } = selection;
                    const line = $from.nodeBefore?.textContent || '';
                    return line == "/"
                }} >

                    <Paper w={200} shadow='md' radius={"md"} withBorder py={"xs"} >


                    </Paper>
                </FloatingMenu>
                <BubbleMenu editor={editor}>
                    <Button.Group>

                        <Button miw={40} variant="default" size='compact-sm' onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} >H1</Button>
                        <Button miw={40} variant="default" size='compact-sm'>H2</Button>
                        <Button miw={40} variant="default" size='compact-sm'>H3</Button>
                        <Button miw={40} variant="default" size='compact-sm'>P</Button>
                        <Button miw={40} variant="default" size='compact-sm' onClick={() => editor?.chain().focus().toggleBold().run()}>B</Button>
                    </Button.Group>
                </BubbleMenu>


            </Paper>
            {/* </Box> */}
        </Group>

    );
}