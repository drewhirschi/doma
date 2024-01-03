"use client"

import {
    AreaHighlight,
    Highlight,
    PdfHighlighter,
    PdfLoader,
    Popup,
    ScaledPosition,
    Tip
} from "react-pdf-highlighter";
import { Autocomplete, Box, Button, Divider, Group, Loader, Menu, Paper, Stack, Text, UnstyledButton, rem } from "@mantine/core";
import { IconArrowsLeftRight, IconMessageCircle, IconPhoto, IconSearch, IconSettings, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import type { Position } from "react-pdf-highlighter";
import { browserClient } from "@/supabase/BrowerClients";
import { extractTextFromPDF } from "@/textMap";
import { getUserTenant } from "@/shared/getUserTenant";
import { revalidatePath } from "next/cache";
import { serverActionClient } from "@/supabase/ServerClients";
import { v4 as uuidv4 } from 'uuid';

type IAnnotation = {
    position: ScaledPosition;
    text: string | undefined
    id: string

}

interface Props {
    pdfUrl: string
    projectId: string
    contractId: string
    parslets: { id: string, display_name: string }[]
    annotations: IAnnotation[]
}


function HighlightPopup() {

    return (
        <Paper shadow="md" w={200} p={"md"}>hello wolrd</Paper>
    )

}



export function PDFHighlighter({ pdfUrl, contractId, parslets, annotations, projectId }: Props) {

    const [highlights, setHighlights] = useState<IAnnotation[]>(annotations.map((a) => ({ ...a })))

    const supabase = browserClient()

    useEffect(() => {
        // supabase.channel("realtime_annotation").on("postgres_changes", {
        //     event: '*',
        //     schema: 'public',
        //     table: 'annotation',
        //     filter: `contract_id=eq.${contractId}`,
        // }, (payload) => console.log(payload)).subscribe()

       

        return () => {

        }
    }, [])



    async function addHighlight(parsletId: string, text: string | undefined, position: ScaledPosition,) {

        const id = uuidv4()

        setHighlights([{ text, position, id, }, ...highlights])
        const tenant_id = await getUserTenant(supabase)
        const { data, error } = await supabase.from("annotation").insert({
            id,
            parslet_id: parsletId,
            contract_id: contractId,
            text,
            position,
            tenant_id
        })

        // revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`, "page")
        if (error) {
            //remove highlight from state
        }
    }

    function updateHighlight(highlightId: string, position: Object, content: Object) {
        console.log("Updating highlight", highlightId, position, content);

        // setHighlights(highlights.map((h) => {
        //     const {
        //         id,
        //         position: originalPosition,
        //         content: originalContent,
        //         ...rest
        //     } = h;
        //     return id === highlightId
        //         ? {
        //             id,
        //             position: { ...originalPosition, ...position },
        //             content: { ...originalContent, ...content },
        //             ...rest,
        //         }
        //         : h;
        // })
        // )
    }

    const resetHash = () => {
        document.location.hash = "";
    };

    return (
        <PdfLoader
            url={pdfUrl}
            beforeLoad={<Loader />}
        >
            {(pdfDocument) => (
                <PdfHighlighter
                    pdfDocument={pdfDocument}
                    highlights={highlights.map((h) => ({ position: h.position, comment: { text: "", emoji: "" }, content: { text: h.text }, id: h.id }))}
                    enableAreaSelection={(event) => event.altKey}
                    onScrollChange={resetHash}
                    // // pdfScaleValue="page-width"
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

                                    {parslets.map((parslet) => (
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
                                            }}
                                            leftSection={<IconMessageCircle style={{ width: rem(14), height: rem(14) }} />}
                                        >

                                            {parslet.display_name}
                                        </Button>
                                    ))}
                                </Button.Group>
                                <Autocomplete
                                    data={[
                                        { value: "test", label: "test" },
                                        { value: "test2", label: "test2" },
                                        { value: "test3", label: "test3" },
                                    ]}
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
                                popupContent={<HighlightPopup />}
                                onMouseOver={(popupContent) =>
                                    setTip(highlight, (highlight) => popupContent)
                                }
                                onMouseOut={hideTip}

                                key={index}
                                children={(<Highlight
                                    isScrolledTo={isScrolledTo}
                                    position={highlight.position}
                                    comment={highlight.comment}
                                    onClick={() => { }}
                                />)}
                            />
                        );
                    }}
                />
            )}
        </PdfLoader>
    )
}