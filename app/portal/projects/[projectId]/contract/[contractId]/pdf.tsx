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
import { Button, Paper, Skeleton, Stack, Text, rem } from "@mantine/core";
import { IconMessageCircle, IconTrash } from "@tabler/icons-react";

import { Json } from "@/types/supabase-generated";
import { browserClient } from "@/supabase/BrowerClients";
import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

interface Props {
    pdfUrl: string
    pdfBase64: string
    contract: Contract_SB & { annotation: Annotation_SB[], extracted_information: (ExtractedInformation_SB & { contract_line: ContractLine_SB[] })[] }
    parslets: Parslet_SB[]
    highlights: { position: any, id: string, text: string, parslet_id: string }[]
    setHighlights: (highlights: { position: any, id: string, text: string, parslet_id: string }[]) => void
}

export default function PDFView({ pdfBase64,pdfUrl, highlights, contract, parslets, setHighlights }: Props) {
    const supabase = browserClient()

    function HighlightPopup({ id, closeMenu, annotations }: { id: string, closeMenu: () => void, annotations: any[] }) {
        const supabase = browserClient()

        const annotation = annotations.find((a) => a.id === id)
        return (
            <Paper
                shadow="lg"
                w={200}
                withBorder
                p={"xs"}>
                <Text fw={700} mb={"sm"}>{parslets.find(p => p.id == annotation?.parslet_id)?.display_name ?? "Extractor not found"}</Text>
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
                        await supabase.from("extracted_information").delete().eq("id", id)
                        await supabase.from("annotation").delete().eq("id", id)

                    }}
                >
                    Delete
                </Button>

            </Paper>
        )

    }

    let scrollViewerTo = (highlight: any) => { }

    function scrollToHighlightFromHash() {
        const highlight = highlights.find((h) => h.id == window.location.hash.slice(1));

        if (highlight) {
            console.log("scrolling to", highlight)
            scrollViewerTo(highlight);
        }
    };

    useEffect(() => {
        window.addEventListener(
            "hashchange",
            scrollToHighlightFromHash,
            false
        );

        return () => {
            window.removeEventListener(
                "hashchange",
                scrollToHighlightFromHash,
                false
            );
        };
    }, [])

    async function addHighlight(parsletId: string, text: string | undefined, position: ScaledPosition,) {

        const id: string = uuidv4()

        setHighlights([{ text: text ?? "", position, id, parslet_id: parsletId }, ...highlights])
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


    const resetHash = () => {
        document.location.hash = "";
    };


    const pdfHighlights = highlights.map((h) => ({ position: h.position! as ScaledPosition, content: { text: h.text }, id: h.id! }))

    return (
        <div
            style={{
                height: "100dvh",
                position: "relative",
            }}
        >

            <PdfLoader
                pdfBase64={pdfBase64}
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


                    return (

                        <PdfHighlighter
                            pdfDocument={pdfDocument}
                            highlights={pdfHighlights}
                            enableAreaSelection={(event) => event.altKey}
                            onScrollChange={resetHash}
                            pdfScaleValue="page-width"
                            // pdfScaleValue=".75"
                            scrollRef={(scrollTo) => {
                                scrollViewerTo = scrollTo;
                                // scrollToHighlightFromHash();
                            }}
                            onSelectionFinished={(
                                position,
                                content,
                                hideTipAndSelection,
                                transformSelection
                            ) => {
                                console.log("scaled hightlight", position)

                                return (


                                    <Paper shadow="md" w={200} p={"md"}>



                                        <Stack gap={"sm"}>
                                            <Text c="dimmed" size="sm">Recent</Text>
                                            <Button.Group orientation="vertical">

                                                {parslets
                                                    .map((parslet) => (
                                                        <Button
                                                            size="sm"
                                                            c="black"
                                                            color="gray"
                                                            variant="subtle"
                                                            key={parslet.id}
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
                                        popupContent={
                                            <HighlightPopup
                                                id={highlight.id}
                                                closeMenu={hideTip}
                                                annotations={highlights}

                                            />}
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
                                        />
                                    </Popup>
                                );
                            }}
                        />
                    )
                }}
            </PdfLoader>
        </div>
    );
}