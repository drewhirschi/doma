"use client"

import { ActionIcon, Autocomplete, Box, Button, Center, CloseButton, Divider, Flex, Group, Loader, Menu, Paper, ScrollArea, Skeleton, Stack, Text, Textarea, UnstyledButton, rem } from "@mantine/core";
import {
    AreaHighlight,
    Highlight,
    PdfHighlighter,
    PdfLoader,
    Popup,
    ScaledPosition,
    Tip
} from "react-pdf-highlighter";
import { IconArrowsLeftRight, IconGripVertical, IconMessageCircle, IconPhoto, IconSearch, IconSettings, IconTrash } from "@tabler/icons-react";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useEffect, useOptimistic, useRef, useState } from "react";

import { BackButton } from "@/components/BackButton";
import { Json } from "@/types/supabase-generated";
import { browserClient } from "@/supabase/BrowerClients";
import { v4 as uuidv4 } from 'uuid';

interface Props {
    pdfUrl: string
    projectId: string
    contractId: string
    parslets: { id: string, display_name: string }[]
    annotations: Annotation_SB[]
}





export function ContractReviewer(props: Props) {

    const { pdfUrl, contractId, annotations, projectId } = props



    const ref = useRef<ImperativePanelHandle>(null);

    const [parslets, setParslets] = useState<{ id: string, display_name: string, lastUsed?: Date }[]>(props.parslets)

    const [highlights, setHighlights] = useState<Partial<Annotation_SB>[]>(annotations.map((a) => ({ ...a })))


    const supabase = browserClient()




    function HighlightPopup({ id, closeMenu }: { id: string, closeMenu: () => void }) {

        return (
            <Paper shadow="lg" w={200} withBorder
                p={"xs"}>

                <Button
                    fullWidth
                    variant="subtle"
                    color="red"
                    rightSection={(<IconTrash />)}
                    onClick={async () => {
                        setHighlights(highlights.filter((h) => h.id !== id))
                        closeMenu()
                        const { data, error } = await supabase.from("annotation").delete().eq("id", id)

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
            // @ts-ignore
            id,
            parslet_id: parsletId,
            contract_id: contractId,
            text,
            position,
        })

        if (error) {
            //remove highlight from state
        }
    }


    const resetHash = () => {
        document.location.hash = "";
    };

    console.log("wdithc", ref.current?.getSize())

    return (

        <PanelGroup direction="horizontal">
            <Panel defaultSize={40} minSize={20} style={{ height: "100dvh" }}>
                <Stack justify="space-between" align="stretch" gap="xs" pl={"md"} style={{ height: "100dvh" }}>
                    <BackButton href={`/portal/projects/${projectId}/tabs`} mt={"md"} style={{alignSelf: "flex-start"}}/>
                    <ScrollArea
                        offsetScrollbars
                        h={"100%"}
                    >

                        {parslets.map((parslet) => (
                            <div key={parslet.id}>
                                <Text size="lg" mt={"lg"} fw={700}>{parslet.display_name}</Text>
                                <Textarea
                                    // w={"100%"}
                                />
                                <ul>
                                    {highlights.filter((highlight) => highlight.parslet_id === parslet.id).map((highlight) => (
                                        <Group key={highlight.id}>
                                            <ActionIcon variant="outline" color="red"
                                                onClick={async () => {
                                                    setHighlights(highlights.filter((h) => h.id !== highlight.id))
                                                    const { data, error } = await supabase.from("annotation").delete().eq("id", highlight.id!)
                                                }}
                                            >
                                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                            </ActionIcon>
                                            <Text key={highlight.parslet_id + parslet.id}>{highlight.text}</Text>
                                        </Group>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </ScrollArea>
                </Stack>

            </Panel>
            <PanelResizeHandle style={{ width: "16px" }}><Center h={'100dvh'}>
                <IconGripVertical /> </Center></PanelResizeHandle>
            <Panel minSize={30} defaultSize={60} ref={ref} >


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
                        {(pdfDocument) => (

                            <PdfHighlighter
                                // @ts-ignore
                                pdfDocument={pdfDocument}
                                highlights={highlights.map((h) => ({ position: h.position! as ScaledPosition, comment: { text: "", emoji: "" }, content: { text: h.text }, id: h.id! }))}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                pdfScaleValue="page-width"
                                scrollRef={(scrollTo) => { }}
                                onSelectionFinished={(
                                    position,
                                    content,
                                    hideTipAndSelection,
                                    transformSelection
                                ) => (

                                    <Paper shadow="md" w={200} p={"md"}>


                                        <Stack gap={"sm"}>
                                            <Text c="dimmed" size="sm">Recent</Text>
                                            <Button.Group orientation="vertical">

                                                {[...parslets].sort((a, b) => (b.lastUsed?.getTime() ?? 0) - (a.lastUsed?.getTime() ?? 0))
                                                    .slice(0, 3)
                                                    .map((parslet) => (
                                                        <Button
                                                            size="sm"
                                                            c="black"
                                                            color="gray"
                                                            variant="subtle"
                                                            key={parslet.id}
                                                            //  leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                                            onClick={() => {
                                                                addHighlight(parslet.id, content.text, position);
                                                                hideTipAndSelection();
                                                                // Set the lastUsed field on the parslet
                                                                setParslets(parslets.map((p) => {
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
                                            <Autocomplete
                                                data={
                                                    parslets.map((p) => ({ value: p.id, label: p.display_name }))

                                                }
                                                placeholder="Search"
                                                onChange={(value) => console.log(value)}
                                            />
                                        </Stack>





                                    </Paper>
                                )}
                                highlightTransform={(
                                    highlight,
                                    index,
                                    setTip,
                                    hideTip,
                                    viewportToScaled,
                                    screenshot,
                                    isScrolledTo
                                ) => {
                                    // const isTextHighlight = true
                                    // //  !Boolean(
                                    // //     highlight.content && highlight.content.image
                                    // // );

                                    // const component = isTextHighlight ? (
                                    //     <>

                                    //     </>
                                    // ) : (
                                    //     <AreaHighlight
                                    //         isScrolledTo={isScrolledTo}
                                    //         highlight={highlight}
                                    //         onChange={(boundingRect) => {
                                    //             updateHighlight(
                                    //                 highlight.id,
                                    //                 { boundingRect: viewportToScaled(boundingRect) },
                                    //                 { image: screenshot(boundingRect) }
                                    //             );
                                    //         }}
                                    //     />
                                    // );

                                    return (
                                        <Popup
                                            popupContent={<HighlightPopup id={highlight.id} closeMenu={hideTip} />}
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
                        )}
                    </PdfLoader>
                </div>

            </Panel>


        </PanelGroup>



    )


}