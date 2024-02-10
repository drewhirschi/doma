"use client"

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { ActionIcon, Button, Center, CopyButton, Flex, Group, HoverCard, Menu, Paper, ScrollArea, Skeleton, Stack, Text, Textarea, Title, Tooltip, rem } from "@mantine/core";
import {
    AreaHighlight,
    Highlight,
    PdfHighlighter,
    PdfLoader,
    Popup,
    Position,
    ScaledPosition,
    Tip
} from "@/components/PdfViewer";
import { Editor, useEditor } from '@tiptap/react';
import {
    Hyperlink,
    previewHyperlinkModal,
    setHyperlinkModal
} from "@docs.plus/extension-hyperlink";
import { IconCheck, IconCloudCheck, IconCopy, IconDotsVertical, IconGripVertical, IconListSearch, IconMessageCircle, IconRefresh, IconSettings, IconTrash } from "@tabler/icons-react";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { completeContractAction, deleteContractExtractedInfo, reviewContractAction } from "./ContractReviewer.actions";
import { useEffect, useOptimistic, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { BackButton } from "@/components/BackButton";
import { Json } from "@/types/supabase-generated";
import MetadataItem from '@/components/MetadataItem';
import { NoteEditor } from './NoteEditor';
import StarterKit from '@tiptap/starter-kit';
import { browserClient } from "@/supabase/BrowerClients";
import { buildAnnotationFromExtraction } from "./helpers";
import dynamic from 'next/dynamic'
import { linkPreviewToolTip } from './LinkPreviewTooltip';
import { sleep } from '@/utils';
import { useDebouncedCallback } from 'use-debounce';

const PDFView = dynamic(() => import('./pdf'), { ssr: false })


export type ParsletWithNotes = Parslet_SB & { contract_note: { content: string }[] }
interface Props {
    pdfUrl: string
    pdfBase64: string
    projectId: string
    contract: Contract_SB & { annotation: Annotation_SB[], extracted_information: (ExtractedInformation_SB & { contract_line: ContractLine_SB[] })[] }
    parslets: ParsletWithNotes[]
    annotations: Annotation_SB[]
}



export function ContractReviewer(props: Props) {

    const { pdfUrl, contract, annotations, projectId, parslets } = props



    const panelRef = useRef<ImperativePanelHandle>(null);

    
    const extractionsHighlights = contract.extracted_information.map(buildAnnotationFromExtraction)
    
    const [highlights, setHighlights] = useState<{ position: any, id: string, text: string, parslet_id: string }[]>([...annotations, ...extractionsHighlights, ])
    const [savingNotes, setSavingNotes] = useState(false)
    const supabase = browserClient()

    // const editors = parslets.reduce((acc: { [key: string]: Editor }, parslet: ParsletWithNotes) => {
    //     const editor = useEditor({
    //         extensions: [StarterKit,
    //             Hyperlink.configure({
    //                 hyperlinkOnPaste: false,
    //                 openOnClick: true,
    //                 modals: {
    //                     previewHyperlink: linkPreviewToolTip,
    //                     setHyperlink: setHyperlinkModal,
    //                 },
    //             }),
    //         ],
    //         content: parslet.contract_note[0]?.content ?? "",
    //     });
    //     if (editor) {
    //         acc[parslet.id] = editor
    //     }
    //     return acc
    // }, {})




    const router = useRouter()
    const pathname = usePathname()

    const debouncedSaveNote = useDebouncedCallback(async (value: string, parsletId: string) => {

        console.log("saving note", value, parsletId)
        setSavingNotes(true)
        const { data, error } = await supabase.from("contract_note").upsert({
            contract_id: contract.id,
            parslet_id: parsletId,
            content: value
        })
        setSavingNotes(false)

    }, 600)


    async function handleAddHighlight(highlight: { position: any, text: string, parslet_id: string }) {
        const { position, text, parslet_id: parsletId } = highlight
        const id: string = window.crypto.randomUUID()


        setHighlights([{ text: text ?? "", position, id, parslet_id: parsletId }, ...highlights])
        // editors[parsletId].commands.insertContent(`<br/> <a href="${pathname}#${id}">${text}</a>`, { parseOptions: {} })
        const { data, error } = await supabase.from("annotation").insert({
            id,
            parslet_id: parsletId,
            contract_id: contract.id,
            text: text ?? "",
            position: position as unknown as Json,

        })

        if (error) {
            //remove highlight from state
        }
    }





    return (

        <PanelGroup direction="horizontal">
            <Panel defaultSize={40} minSize={20} style={{ height: "100dvh" }}>
                <Stack justify="space-between" align="stretch" gap="xs" pl={"md"} style={{ height: "100dvh" }}>
                    <Group mt={"md"}>
                        <BackButton href={`/portal/projects/${projectId}/tabs`} style={{ alignSelf: "flex-start" }} />
                        {savingNotes ? <IconRefresh color="gray" size={20} /> : <IconCloudCheck color="gray" size={20} />}

                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <ActionIcon variant="subtle" c={"gray"}>
                                    <IconDotsVertical />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Application</Menu.Label>
                                <Menu.Item leftSection={<IconCheck style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={async () => {
                                        await completeContractAction(contract.id)


                                    }}
                                >
                                    Mark completed
                                </Menu.Item>
                                <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        reviewContractAction(contract.id)
                                    }}
                                >
                                    Run AI extraciton
                                </Menu.Item>
                                <Menu.Item color="red" leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        deleteContractExtractedInfo(contract.id, projectId)
                                    }}
                                >
                                    Clear extracted info
                                </Menu.Item>

                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                    <HoverCard openDelay={500}>
                        <HoverCard.Target>
                            <Title order={3}>{contract.display_name}</Title>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Group>
                                <Text>
                                    <MetadataItem header="Contract ID" text={contract.id}/>
                                </Text>
                                <CopyButton value={contract.id} timeout={2000}>
                                    {({ copied, copy }) => (
                                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                            <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                                                {copied ? (
                                                    <IconCheck style={{ width: rem(16) }} />
                                                ) : (
                                                    <IconCopy style={{ width: rem(16) }} />
                                                )}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            </Group>
                        </HoverCard.Dropdown>
                    </HoverCard>
                    <ScrollArea
                        offsetScrollbars
                        h={"100%"}
                    >

                        {parslets.map((parslet) => (
                            <div key={parslet.id}>
                                {/* <NoteEditor parslet={parslet} editor={editors[parslet.id]} /> */}
                                <Text size="lg" mt={"lg"} fw={700}>{parslet.display_name}</Text>
                                <Textarea
                                    defaultValue={parslet.contract_note[0]?.content ?? ""}
                                    autosize
                                    minRows={2}
                                    onChange={(event) => debouncedSaveNote(event.currentTarget.value, parslet.id)}
                                />
                                <Stack gap={"xs"} mt="sm">
                                    {highlights
                                        .filter((highlight) => highlight.parslet_id === parslet.id)
                                        .map((highlight) => (
                                            <Flex direction={"row"} wrap={"nowrap"} gap={"xs"} key={highlight.id}>
                                                <ActionIcon
                                                    onClick={async () => {

                                                        router.replace(pathname.split("#")[0] + "#" + highlight.id)
                                                        await sleep(100)
                                                        window.dispatchEvent(new HashChangeEvent('hashchange'));


                                                    }}
                                                >

                                                    <IconListSearch style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                                </ActionIcon>
                                                <ActionIcon variant="outline" color="red"
                                                    onClick={async () => {
                                                        setHighlights(highlights.filter((h) => h.id !== highlight.id))
                                                        await supabase.from("annotation").delete().eq("id", highlight.id!)
                                                        await supabase.from("extracted_information").delete().eq("id", highlight.id!)
                                                    }}
                                                >
                                                    <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                                </ActionIcon>
                                                <HoverCard shadow="md" openDelay={500}>

                                                    <HoverCard.Target>
                                                        <Text key={highlight.parslet_id + parslet.id}>{highlight.text}</Text>
                                                    </HoverCard.Target>
                                                    <HoverCard.Dropdown>
                                                    <MetadataItem header="y1" text={highlight.position.boundingRect.y1}/>
                                                    <MetadataItem header="y2" text={highlight.position.boundingRect.y2}/>
                                                        {/* Bounding: {JSON.stringify(highlight.position.boundingRect) ?? "no bounding rect"} */}
                                                        <br />
                                                        EI id: {highlight.id}
                                                    </HoverCard.Dropdown>
                                                </HoverCard>
                                            </Flex>
                                        ))}

                                </Stack>
                            </div>
                        ))}
                    </ScrollArea>
                </Stack>

            </Panel>
            <PanelResizeHandle style={{ width: "16px" }}>
                <Center h={'100dvh'}>
                    <IconGripVertical />
                </Center>
            </PanelResizeHandle>
            <Panel minSize={30} defaultSize={60} ref={panelRef} >
                <PDFView
                    pdfUrl={pdfUrl}
                    pdfBase64={props.pdfBase64}
                    contract={contract}
                    parslets={parslets}
                    highlights={highlights}
                    handleAddHighlight={handleAddHighlight}
                    handleRemoveHighlight={(id) => {
                        setHighlights(highlights.filter((h) => h.id !== id))
                    }}
                />

                {/* <p>
                    page {1}
                </p>
                <Document file={{data:props.pdfBase64}}>
                    <Page pageNumber={1} />
                </Document> */}

            </Panel>


        </PanelGroup >



    )


}