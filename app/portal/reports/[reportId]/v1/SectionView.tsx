'use client';

import { ActionIcon, Box, Button, Divider, Drawer, Fieldset, Group, Indicator, Paper, Radio, Stack, TextInput, Title } from '@mantine/core';
import { BubbleMenu, EditorContent, EditorProvider, FloatingMenu, useEditor } from '@tiptap/react'
import React, { useState } from 'react';
import { exaSearch, searchAllSections } from './actions';
import { getLLMResponse, getSearchResults } from './helpers';

import { ISection } from './types';
import { IconTrash } from '@tabler/icons-react';
import { Markdown } from 'tiptap-markdown';
import { NewSectionDrawer } from '../v2/NewSectionDrawer';
import Placeholder from '@tiptap/extension-placeholder'
import { SectionDrawerContents } from './SectionEditDrawer';
import StarterKit from '@tiptap/starter-kit'
import { browserClient } from '@/ux/supabase-client/BrowserClient';
import { useDebouncedCallback } from 'use-debounce';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

// define your extension array
const extensions = [StarterKit,
    Placeholder.configure({
        placeholder: 'Write something... Or type / to use commands',
        showOnlyWhenEditable: true
    }),
    Markdown,

]


interface ISectionViewProps {
    section: ReportSection_SB & { search_result: SearchResult_SB[] }
    report: Report_SB

}

export function SectionView({ section, report }: ISectionViewProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [drafterOpened, { open: openDrafter, close: closeDrafter }] = useDisclosure(false);
    const searchAndDraftform = useForm({
        // mode: 'uncontrolled',
        initialValues: {
            instruction: section.instruction || "",
            recency: 3,
            exclusions: ""
        },

        validate: {
            exclusions: (value) => {
                const domains = value.split(',').map(d => d.trim());
                const invalidDomains = domains.filter(d => !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(d));
                return invalidDomains.length > 0 ? `Invalid domain(s): ${invalidDomains.join(', ')}` : null;
            },
        },
    });
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
            <Title order={4}>{section.title}</Title>
            <EditorContent editor={editor} />
            <Group justify='flex-end' gap={"xs"}>
                <Indicator
                    disabled={section.is_generated}
                // processing
                >

                    <Button variant="default" size='compact-sm'
                        onClick={openDrafter}
                    >Search</Button>
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
                title={section.title}
                position="right"
            >
                <SectionDrawerContents
                    editor={editor}
                    topic={report.topic ?? ""}
                    sectionData={section}
                />
            </Drawer>
            <Drawer
                title={section.title}
                offset={8} radius="md" size={"xl"}
                opened={drafterOpened}
                onClose={closeDrafter}
                // title={activeSetcion?.name}
                position="right"
            >
                {/* <TextInput
                    label="Section Description"
                    {...searchAndDraftform.getInputProps("instruction")}
                /> */}
                <Fieldset legend="Search parameters">
                    <Radio.Group
                        {...searchAndDraftform.getInputProps("recency")}
                        label="Recency"
                        description="This is anonymous"
                        withAsterisk
                    >
                        <Group mt="xs">
                            <Radio checked value={3} label="3 months" />
                            <Radio value={6} label="6 months" />
                            <Radio value={12} label="1 year" />
                        </Group>
                    </Radio.Group>
                    <TextInput label="Exclusions" description="Websites we should exclude (comma separated)"
                        {...searchAndDraftform.getInputProps("exclusions")}

                    />
                </Fieldset>
                <Group justify='flex-end'>

                    <Button
                        onClick={async () => {
                            const searchResults = await getSearchResults([`${report.topic}: ${section.title}`], 5, searchAndDraftform.values.recency)

                            const summaries = await Promise.all(searchResults.map(async (result) => {
                                const options = {
                                    user: `Summarize the following article about "${section.title}" in ${report.topic}` + `\n<arcticle>\n${result.text}\n</arcticle>`,
                                }
                                const summary = await getLLMResponse(options)
                                return summary
                            }))

                            const resultsForInsert: Omit<SearchResult_SB, "id">[] = searchResults.map((result, idx) => {


                                return {
                                    author: result.author ?? "",
                                    exa_id: result.id,
                                    url: result.url,
                                    title: result.title,
                                    publish_date: result.publishedDate || null,
                                    report_id: report.id,
                                    section_id: section.id,
                                    text: result.text,
                                    summary: summaries[idx].text
                                }
                            })
                            const insert = await sb.from('search_result').insert(resultsForInsert)

                            if (insert.error) {
                                console.log(insert.error)
                            }
                            closeDrafter()
                        }}
                    >Submit</Button>
                </Group>
            </Drawer>
        </Paper>
    );
}