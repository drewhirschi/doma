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
import { Button, MantineProvider, NavLink, Paper, ScrollArea, Skeleton, Stack, Text, TextInput, rem } from "@mantine/core";
import { ElementType, useEffect, useState } from "react";
import { IconFingerprint, IconGauge, IconMessageCircle, IconTrash } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

import { DummyMenu } from "@/components/DummyMenu";
import { FormatterWithInfo } from "@/types/complex";
import { browserClient } from "@/supabase/BrowerClients";
import { getFormatterShape } from "@/shared/getFormatterShape";
import { theme } from "../../../../../../theme";

interface Props {
    pdfUrl: string
    pdfBase64: string
    contract: Contract_SB
    highlights: Annotation_SB[]
    handleAddHighlight: (highlight: { position: any, text: string, formatterKey: string, itemId: number }) => void
    handleRemoveHighlight: (id: string) => void
    formatters: FormatterWithInfo[]

}

export default function PDFView({ pdfBase64, pdfUrl, highlights, handleRemoveHighlight, handleAddHighlight, formatters }: Props) {
    const supabase = browserClient()
    const router = useRouter()
    const pathname = usePathname()

    // useEffect(() => {
        
    // }, [formatters])

    const [parsletSearchTerm, setParsletSearchTerm] = useState("")

    function HighlightPopup({ id, closeMenu, annotations }: { id: string, closeMenu: () => void, annotations: any[] }) {

        const annotation = annotations.find((a) => a.id === id)
        return (
            <Paper
                shadow="lg"
                w={200}
                withBorder
                p={"xs"}
            >
                {/* <Text fw={700} mb={"sm"}>{parslets.find(p => p.id == annotation?.parslet_id)?.display_name ?? "Extractor not found"}</Text> */}

                <Button
                    fullWidth
                    variant="subtle"
                    color="red"
                    rightSection={(<IconTrash />)}
                    onClick={async () => {
                        handleRemoveHighlight(id)
                        closeMenu()

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
                        <MantineProvider theme={theme}>

                            <PdfHighlighter<Annotation_SB>
                                pdfDocument={pdfDocument}
                                highlights={highlights}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                pdfScaleValue="page-width"
                                // pdfScaleValue=".75"
                                scrollRef={(scrollTo) => {
                                    scrollViewerTo = scrollTo;
                                }}
                                onSelectionFinished={(
                                    position,
                                    content,
                                    hideTipAndSelection,
                                    transformSelection
                                ) => {
                                    console.log({ position, content })
                                    return (


                                        <Paper
                                            shadow="md"
                                            pt={"md"}
                                            pl={"sm"}
                                        //   pr={"xs"}

                                        >
                                            Topics
                                            <ScrollArea
                                                h={300}
                                                w={220}
                                                type="always"
                                                pr={"sm"}
                                            >

                                                {formatters.map((formatter, i) => {

                                                    const props = {
                                                        label: formatter.display_name,
                                                        childrenOffset: 28,

                                                    }
                                                    const handleClick = (itemIndex: number) => {
                                                        handleAddHighlight({ formatterKey: formatter.key, text: content.text ?? "", position, itemId: itemIndex });
                                                        hideTipAndSelection();

                                                    }
                                                    if (formatter.hitems) return (
                                                        <NavLink key={i} {...props} component="button">
                                                            {formatter.formatted_info.map((fi, j) => (
                                                                <NavLink key={`${i}.${j}`} label={`Item ${j + 1}`} component="button" onClick={() => handleClick(fi.id)} />
                                                            ))}
                                                            <NavLink key={i} label={`New item`} component="button" onClick={() => handleClick(formatter.formatted_info.length == 0 ? 0 : Math.max(...formatter.formatted_info.map(fi => fi.id)) + 1)} />

                                                        </NavLink>
                                                    ); else return (
                                                        <NavLink
                                                            key={i}
                                                            {...props}
                                                            component="button"
                                                            onClick={() => handleClick(0)}
                                                        />
                                                    );
                                                }
                                                )}

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
                                        // <Popup
                                        //     popupContent={
                                        //         <HighlightPopup
                                        //             id={highlight.id}
                                        //             closeMenu={hideTip}
                                        //             annotations={highlights}

                                        //         />}
                                        //     onMouseOver={(popupContent) =>
                                        //         setTip(highlight, (highlight) => popupContent)
                                        //     }
                                        //     onMouseOut={hideTip}

                                        //     key={index}

                                        // >

                                            <Highlight
                                                key={highlight.id}
                                                isScrolledTo={isScrolledTo}
                                                position={highlight.position}
                                                onClick={() => handleRemoveHighlight(highlight.id)}
                                                isUserHighlight={highlight.is_user}
                                            />
                                        // {/* </Popup> */}
                                    );
                                }}
                            />
                        </MantineProvider>

                    )
                }}
            </PdfLoader>
        </div>
    );
}