"use client"

import { ActionIcon, Button, Center, Flex, Group, Menu, Paper, ScrollArea, Skeleton, Stack, Text, Textarea, rem } from "@mantine/core";
import {
    AreaHighlight,
    Highlight,
    PdfHighlighter,
    PdfLoader,
    Popup,
    ScaledPosition,
    Tip
} from "react-pdf-highlighter";
import { IconArrowsLeftRight, IconDots, IconDotsVertical, IconGripVertical, IconMessageCircle, IconSettings, IconTrash } from "@tabler/icons-react";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useEffect, useOptimistic, useRef, useState } from "react";

import { BackButton } from "@/components/BackButton";
import { Json } from "@/types/supabase-generated";
import { browserClient } from "@/supabase/BrowerClients";
import { buildAnnotationFromExtraction } from "./helpers";
import { reviewContractAction } from "./ContractReviewer.actions";
import { useDebouncedCallback } from 'use-debounce';
import { v4 as uuidv4 } from 'uuid';

type ParsletWithNotes = Parslet_SB & { contract_note: { content: string }[] }
interface Props {
    pdfUrl: string
    projectId: string
    contract: Contract_SB & { annotation: Annotation_SB[], extracted_information: (ExtractedInformation_SB & { contract_line: ContractLine_SB[] })[] }
    parslets: ParsletWithNotes[]
    annotations: Annotation_SB[]
}





export function ContractReviewer(props: Props) {

    const { pdfUrl, contract, annotations, projectId } = props



    const ref = useRef<ImperativePanelHandle>(null);

    const [parslets, setParslets] = useState<(ParsletWithNotes & { lastUsed?: Date })[]>(props.parslets)
    const extractionsHighlights = contract.extracted_information.map(buildAnnotationFromExtraction)
    // console.log(extractionsHighlights, "extractionsHighlights")
    const [highlights, setHighlights] = useState<{ position: any, id: string, text: string, parslet_id: string | null }[]>([...annotations, ...extractionsHighlights])
    const [savingNotes, setSetsavingNotes] = useState(false)
    const supabase = browserClient()

    const debouncedSaveNote = useDebouncedCallback(async (value: string, parsletId:string) => {

       console.log("saving note",value,parsletId)
        setSetsavingNotes(true)
        const {data, error} = await supabase.from("contract_note").upsert({
            contract_id: contract.id,
            parslet_id: parsletId,
            content: value
        })
        setSetsavingNotes(false)
        
    }, 1200)





    function HighlightPopup({ id, closeMenu, annotations }: { id: string, closeMenu: () => void, annotations: any[] }) {

        const annotation = annotations.find((a) => a.id === id)
        return (
            <Paper shadow="lg" w={200} withBorder
                p={"xs"}>
                <Text fw={700} mb={"sm"}>{parslets.find(p => p.id == annotation?.parslet_id)?.display_name}</Text>
                {/* <Text>
                    {annotation?.text ?? ""}
                </Text> */}
                <Button
                    fullWidth
                    variant="subtle"
                    color="red"
                    rightSection={(<IconTrash />)}
                    onClick={async () => {
                        setHighlights(highlights.filter((h) => h.id !== id))
                        closeMenu()
                        const { data, error } = await supabase.from("extracted_information").delete().eq("id", id)

                    }}
                >
                    Delete
                </Button>

            </Paper>
        )

    }



    async function addHighlight(parsletId: string, text: string | undefined, position: ScaledPosition,) {

        const id: string = uuidv4()

        setHighlights([{ text: text ?? "", position, id, parslet_id: parsletId }, ...highlights])
        const { data, error } = await supabase.from("annotation").insert({
            id,
            parslet_id: parsletId,
            contract_id: contract.id,
            text: text ?? "",
            position: position as unknown as Json,
            // take another look at this
            tenant_id: ""
        })

        if (error) {
            //remove highlight from state
        }
    }


    const resetHash = () => {
        document.location.hash = "";
    };

    const pdfHighlights = highlights.map((h) => ({ position: h.position! as ScaledPosition, comment: { text: "", emoji: "" }, content: { text: h.text }, id: h.id! }))
    return (

        <PanelGroup direction="horizontal">
            <Panel defaultSize={40} minSize={20} style={{ height: "100dvh" }}>
                <Stack justify="space-between" align="stretch" gap="xs" pl={"md"} style={{ height: "100dvh" }}>
                    <Group mt={"md"}>
                        <BackButton href={`/portal/projects/${projectId}/tabs`} style={{ alignSelf: "flex-start" }} />
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <ActionIcon variant="subtle" c={"gray"}>
                                    <IconDotsVertical />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Application</Menu.Label>
                                <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        reviewContractAction(contract.id)
                                    }}
                                >
                                    Run AI
                                </Menu.Item>

                            </Menu.Dropdown>
                        </Menu>
                    </Group>
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
                                <ul>
                                    {highlights.filter((highlight) => highlight.parslet_id === parslet.id).map((highlight) => (
                                        <Flex direction={"row"} wrap={"nowrap"} gap={"sm"} key={highlight.id}>
                                            <ActionIcon variant="outline" color="red"
                                                onClick={async () => {
                                                    setHighlights(highlights.filter((h) => h.id !== highlight.id))
                                                    const { data, error } = await supabase.from("extracted_information").delete().eq("id", highlight.id!)
                                                }}
                                            >
                                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                            </ActionIcon>
                                            <Text key={highlight.parslet_id + parslet.id}>{highlight.text}</Text>
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
            <Panel minSize={30} defaultSize={60} ref={ref} >
                {/* <PdfViewer
                    url={pdfUrl}
                /> */}
                <div
                    style={{
                        height: "100dvh",
                        position: "relative",
                    }}
                >

                    <PdfLoader

                        url={pdfUrl}
                        beforeLoad={
                            <div>

                                <Skeleton p="sm" height={8} radius="xl" mt={"xl"} />
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <Skeleton key={i} p="sm" height={8} radius="xl" mt={"lg"} />
                                ))}

                            </div>
                        }
                    >
                        {(pdfDocument) => {
                            
                            pdfDocument.getPage(1).then((page) => {
                                console.log("first page view port",{width:page.getViewport().viewBox[2],height: page.getViewport().viewBox[3]})
                            })
                            return (

                            <PdfHighlighter
                                pdfDocument={pdfDocument}
                                highlights={pdfHighlights}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                pdfScaleValue=".75"
                                // pdfScaleValue="page-width"
                                scrollRef={(scrollTo) => { }}
                                onSelectionFinished={(
                                    position,
                                    content,
                                    hideTipAndSelection,
                                    transformSelection
                                ) => {
                                    console.log("scaled hightlight",position)
                                    
                                    return (


                                        <Paper shadow="md" w={200} p={"md"}>



                                            <Stack gap={"sm"}>
                                                <Text c="dimmed" size="sm">Recent</Text>
                                                <Button.Group orientation="vertical">

                                                    {[...parslets].sort((a, b) => (b.lastUsed?.getTime() ?? 0) - (a.lastUsed?.getTime() ?? 0))
                                                        .map((parslet) => (
                                                            <Button
                                                                size="sm"
                                                                c="black"
                                                                color="gray"
                                                                variant="subtle"
                                                                key={parslet.id}
                                                                onClick={() => {
                                                                    addHighlight(parslet.id, content.text, position);
                                                                    hideTipAndSelection();                                                                    setParslets(parslets.map((p) => {
                                                                        if (p.id === parslet.id) {
                                                                            return { ...p, lastUsed: new Date() };
                                                                        }
                                                                        return p;
                                                                    }))


                                                                }}
                                                                leftSection={<IconMessageCircle style={{ width: rem(14), height: rem(14) }} />}
                                                            >

                                                                {parslet.display_name}
                                                            </Button>
                                                        ))}
                                                </Button.Group>
                                              
                                            </Stack>





                                        </Paper>
                                    )
                                }}
                                highlightTransform={(
                                    highlight,
                                    index,
                                    setTip,
                                    hideTip,
                                    viewportToScaled,
                                    screenshot,
                                    isScrolledTo
                                ) => {
                                  

                                    return (
                                        <Popup
                                            popupContent={<HighlightPopup id={highlight.id} closeMenu={hideTip} annotations={highlights} />}
                                            onMouseOver={(popupContent) =>
                                                setTip(highlight, (highlight) => popupContent)
                                            }
                                            onMouseOut={hideTip}

                                            key={index}

                                        >
                                            <Highlight
                                                isScrolledTo={isScrolledTo}
                                                position={highlight.position}
                                                onClick={() => { }}
                                                comment={{ emoji: "", text: "" }}
                                            />
                                        </Popup>
                                    );
                                }}
                            />
                        )}}
                    </PdfLoader>
                </div>

            </Panel>


        </PanelGroup>



    )


}