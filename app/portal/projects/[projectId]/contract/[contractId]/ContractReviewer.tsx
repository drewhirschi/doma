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
import { IconCheck, IconCloudCheck, IconCopy, IconDotsVertical, IconGripVertical, IconListSearch, IconMessageCircle, IconRefresh, IconSettings, IconTrash } from "@tabler/icons-react";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { completeContractAction, deleteContractExtractedInfo, reviewContractAction } from "./ContractReviewer.actions";
import { useEffect, useOptimistic, useRef, useState } from "react";

import { BackButton } from "@/components/BackButton";
import { browserClient } from "@/supabase/BrowerClients";
import { buildAnnotationFromExtraction } from "./helpers";
import dynamic from 'next/dynamic'
import { useDebouncedCallback } from 'use-debounce';
import { useRouter } from "next/navigation";

// import { Document, Page, pdfjs } from "react-pdf"













const PDFView = dynamic(() => import('./pdf'), { ssr: false })

// pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"

type ParsletWithNotes = Parslet_SB & { contract_note: { content: string }[] }
interface Props {
    pdfUrl: string
    pdfBase64: string
    projectId: string
    contract: Contract_SB & { annotation: Annotation_SB[], extracted_information: (ExtractedInformation_SB & { contract_line: ContractLine_SB[] })[] }
    parslets: ParsletWithNotes[]
    annotations: Annotation_SB[]
}





export function ContractReviewer(props: Props) {

    const { pdfUrl, contract, annotations, projectId } = props



    const panelRef = useRef<ImperativePanelHandle>(null);

    const [parslets, setParslets] = useState<(ParsletWithNotes & { lastUsed?: Date })[]>(props.parslets)
    const extractionsHighlights = contract.extracted_information.map(buildAnnotationFromExtraction)
    const [highlights, setHighlights] = useState<{ position: any, id: string, text: string, parslet_id: string }[]>([...annotations, ...extractionsHighlights])
    const [savingNotes, setSavingNotes] = useState(false)
    const supabase = browserClient()

    const router = useRouter()

    const debouncedSaveNote = useDebouncedCallback(async (value: string, parsletId: string) => {

        console.log("saving note", value, parsletId)
        setSavingNotes(true)
        const { data, error } = await supabase.from("contract_note").upsert({
            contract_id: contract.id,
            parslet_id: parsletId,
            content: value
        })
        setSavingNotes(false)

    }, 1200)








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
                                    Complete
                                </Menu.Item>
                                <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        reviewContractAction(contract.id)
                                    }}
                                >
                                    Run AI
                                </Menu.Item>
                                <Menu.Item color="red" leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        deleteContractExtractedInfo(contract.id, projectId)
                                    }}
                                >
                                    Delete EI
                                </Menu.Item>

                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                    <HoverCard>
                        <HoverCard.Target>
                            <Title order={3}>{contract.display_name}</Title>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Group>
                                <Text>
                                    id: {contract.id}
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
                                <Text size="lg" mt={"lg"} fw={700}>{parslet.display_name}</Text>
                                <Textarea
                                    defaultValue={parslet.contract_note[0]?.content ?? ""}
                                    autosize
                                    minRows={2}
                                    onChange={(event) => debouncedSaveNote(event.currentTarget.value, parslet.id)}
                                />
                                {/* <ColumnEditor content={parslet.contract_note[0]?.content ?? ""}/> */}
                                <ul>
                                    {highlights
                                        .filter((highlight) => highlight.parslet_id === parslet.id)
                                        .map((highlight) => (
                                            <Flex direction={"row"} wrap={"nowrap"} gap={"sm"} key={highlight.id}>
                                                <ActionIcon
                                                    onClick={() => {

                                                        // router.replace("#" + highlight.id)
                                                        // scrollViewerTo(highlight)

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

                                                        Bounding: {JSON.stringify(highlight.position.boundingRect) ?? "no bounding rect"}
                                                        <br />
                                                        EI id: {highlight.id}
                                                    </HoverCard.Dropdown>
                                                </HoverCard>
                                            </Flex>
                                        ))}

                                </ul>
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
                    setHighlights={setHighlights}
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