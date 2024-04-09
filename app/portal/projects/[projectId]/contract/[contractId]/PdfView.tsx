import {
    Highlight,
    PdfHighlighter,
    PdfLoader,
} from "@/components/PdfViewer";
import { MantineProvider, Paper, ScrollArea, Skeleton, Text } from "@mantine/core";

import { FormatterWithInfo } from "@/types/complex";
import { SelectFormatterButton } from "./SelectFormatterButton";
import { theme } from "../../../../../../theme";
import { useEffect } from "react";

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
                                    const hash = window.location.hash.slice(1);
                                    const selectedHighlight = highlights.find(
                                        (highlight) => highlight.id === hash
                                    );
                                    if (selectedHighlight) {
                                        scrollTo(selectedHighlight);
                                    }
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


                                        <Paper shadow="md">
                                            <Text ml={"sm"}>Topics</Text>
                                            <ScrollArea
                                                h={300}
                                                w={240}
                                                type="always"
                                                pr={"sm"}
                                            >

                                                {formatters.map((formatter) => {


                                                    const handleClick = (itemIndex: number) => {
                                                        handleAddHighlight({ formatterKey: formatter.key, text: content.text ?? "", position, itemId: itemIndex });
                                                        hideTipAndSelection();

                                                    }
                                                    return <SelectFormatterButton
                                                        key={formatter.key}
                                                        formatter={formatter}
                                                        handleClick={handleClick}
                                                    />


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
                                        <Highlight
                                            key={highlight.id}
                                            isScrolledTo={isScrolledTo}
                                            position={highlight.position}
                                            onClick={() => handleRemoveHighlight(highlight.id)}
                                            isUserHighlight={highlight.is_user}
                                        />
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