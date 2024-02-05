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
import { Button, Paper, ScrollArea, Skeleton, Stack, Text, TextInput, rem } from "@mantine/core";
import { IconMessageCircle, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { browserClient } from "@/supabase/BrowerClients";

interface Props {
    pdfUrl: string
    pdfBase64: string
    contract: Contract_SB & { annotation: Annotation_SB[], extracted_information: (ExtractedInformation_SB & { contract_line: ContractLine_SB[] })[] }
    parslets: Parslet_SB[]
    highlights: { position: any, id: string, text: string, parslet_id: string }[]
    handleAddHighlight: (highlight: { position: any,  text: string, parslet_id: string }) => void
    handleRemoveHighlight: (id: string) => void
}

export default function PDFView({ pdfBase64, pdfUrl, highlights, handleRemoveHighlight, parslets, handleAddHighlight }: Props) {
    const supabase = browserClient()
    const router = useRouter()
    const pathname = usePathname()

    const [parsletSearchTerm, setParsletSearchTerm] = useState("")

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
                        handleRemoveHighlight(id)
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


    const resetHash = () => {
        // router.replace(pathname.split("#")[0])
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
                            scrollRef={(scrollTo) => {
                                scrollViewerTo = scrollTo;
                            }}
                            onSelectionFinished={(
                                position,
                                content,
                                hideTipAndSelection,
                                transformSelection
                            ) => {
                                console.log({position, content})
                                return (


                                    <Paper shadow="md" p={"md"}>


                                        <ScrollArea h={300} type="always" >
                                            {/* <TextInput
                                                placeholder="Search"
                                                value={parsletSearchTerm}
                                                onChange={(e) => {console.log(e.currentTarget.value); setParsletSearchTerm(e.currentTarget.value)}}
                                            /> */}
                                            <Button.Group orientation="vertical">

                                                {parslets
                                                    // .filter((parslet) => parsletSearchTerm ? parslet.display_name.toLowerCase().includes(parsletSearchTerm.toLowerCase()) : true)
                                                    .map((parslet) => (
                                                        <Button
                                                            size="sm"
                                                            c="black"
                                                            color="gray"
                                                            variant="subtle"
                                                            key={parslet.id}
                                                            onClick={() => {
                                                                handleAddHighlight({parslet_id: parslet.id, text: content.text ?? "", position});
                                                                hideTipAndSelection();
                                                                // setParsletSearchTerm("")


                                                            }}
                                                            leftSection={<IconMessageCircle style={{ width: rem(14), height: rem(14) }} />}
                                                        >

                                                            {parslet.display_name}
                                                        </Button>
                                                    ))}
                                            </Button.Group>
                                        </ScrollArea>







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