'use client';

import { ActionIcon, Box, Button, Divider, Drawer, Group, Indicator, Paper, Stack, Title } from '@mantine/core';
import { BubbleMenu, EditorContent, EditorProvider, FloatingMenu, useEditor } from '@tiptap/react'
import React, { useState } from 'react';

import { ISection } from './types';
import { IconTrash } from '@tabler/icons-react';
import { Markdown } from 'tiptap-markdown';
import { NewSectionDrawer } from '../v2/NewSectionDrawer';
import Placeholder from '@tiptap/extension-placeholder'
import { SectionDrawerContents } from './SectionEditDrawer';
import StarterKit from '@tiptap/starter-kit'
import { browserClient } from '@/supabase/BrowserClient';
import { useDebouncedCallback } from 'use-debounce';
import { useDisclosure } from '@mantine/hooks';

// define your extension array
const extensions = [StarterKit,
    Placeholder.configure({
        placeholder: 'Write something... Or type / to use commands',
        showOnlyWhenEditable: true
    }),
    Markdown,

]


interface ISectionViewProps {
    section: ReportSection_SB
}

export function SectionView({ section }: ISectionViewProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [drafterOpened, { open:openDrafter, close:closeDrafter }] = useDisclosure(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        content: section.content || "",
        onUpdate: ({ editor }) => {
            debouncedSaveContent(editor.getHTML())
        }
    })

    const sb = browserClient()

    const debouncedSaveContent = useDebouncedCallback(async (content: string) => {
        const update = await sb.from('report_sections').update({ content }).eq('id', section.id!)
        console.log({ update })
    }, 300)


  

    if (!editor) return null



    return (
        <Paper
            withBorder
            // bg={"none"}
            p={"xs"}
        >
            <EditorContent editor={editor} />
            <Group justify='flex-end' gap={"xs"}>
                <Indicator
                // processing
                >

                    <Button variant="default" size='compact-sm'
                        onClick={open}
                    >AI Draft</Button>
                </Indicator>

                <Button variant="default" size='compact-sm'
                    onClick={open}
                >Sources</Button>
                <ActionIcon variant="default" aria-label="Delete">
                    <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>            </Group>
            <FloatingMenu editor={editor} tippyOptions={{ placement: 'bottom-start' }} shouldShow={(props) => {
                const { selection } = props.editor.state;
                const { $from } = selection;
                const line = $from.nodeBefore?.textContent || '';
                return line == "/"
            }} >

                <Paper w={200} shadow='md' radius={"md"} withBorder py={"xs"} >
                    {/* <Title pl={"xs"} order={6} c={"dark.7"}>Basics</Title>
                        <Button.Group variant='subtle' c={"gray"} orientation='vertical' px={"xs"} borderWidth={0}>
                            <Button variant="default" size='compact-sm'
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 })}
                            >Heading 1</Button>
                            <Button variant="default" size='compact-sm'>Heading 2</Button>
                            <Button variant="default" size='compact-sm'>Heading 3</Button>
                        </Button.Group> */}
                    <Title pl={"xs"} pt={4} order={5} c={"dark.7"}>AI Write</Title>
                    <Stack>
                        <NewSectionDrawer />
                        

                    </Stack>
                </Paper>
            </FloatingMenu>
            <BubbleMenu editor={editor}>
                <Button.Group>

                    <Button miw={40} variant="default" size='compact-sm' onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} >H1</Button>
                    <Button miw={40} variant="default" size='compact-sm'>H2</Button>
                    <Button miw={40} variant="default" size='compact-sm'>H3</Button>
                    <Button miw={40} variant="default" size='compact-sm'>P</Button>
                    <Button miw={40} variant="default" size='compact-sm' onClick={() => editor.chain().focus().toggleBold().run()}>B</Button>
                </Button.Group>
            </BubbleMenu>

            <Drawer
                offset={8} radius="md" size={"xl"}
                opened={opened}
                onClose={close}
                // title={activeSetcion?.name}
                position="right"
            >
                <SectionDrawerContents
                    // topic={topic}
                    sectionData={section}
                />
            </Drawer>
        </Paper>
    );
}