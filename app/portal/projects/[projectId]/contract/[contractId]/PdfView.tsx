import {
    Highlight,
    PdfHighlighter,
    PdfLoader,
} from "@/components/PdfViewer";
import { MantineProvider, Paper, ScrollArea, Skeleton, Text } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { FormatterWithInfo } from "@/types/complex";
import { SelectFormatterButton } from "./SelectFormatterButton";
import { off } from "process";
import { theme } from "../../../../../../theme";

interface Props {
    pdfUrl: string
    pdfBase64: string
    contract: Contract_SB
    highlights: Annotation_SB[]
    handleAddHighlight: (highlight: { position: any, text: string, formatterKey: string, itemId: number }) => void
    handleRemoveHighlight: (id: string) => void
    formatters: FormatterWithInfo[]
    parslets: Parslet_SB[]

}


const computeOffsets = (highlights: Annotation_SB[]): { id: string, value: number }[] => {
    // Sort highlights first by page number, then by 'y1' within each page
    const sortedHighlights = [...highlights].sort((a, b) => {
        if (a.position.pageNumber === b.position.pageNumber) {
            return a.position.boundingRect.y1 - b.position.boundingRect.y1;
        }
        return a.position.pageNumber - b.position.pageNumber;
    });

    const offsets: { id: string, value: number }[] = []

    let lastPage = 0;
    let lastBottom = 0;
    sortedHighlights.forEach((highlight, index) => {
        let offset = 0;
        if (index === 0 || highlight.position.pageNumber !== lastPage) {
            // Reset the lastBottom if it's the first item or new page starts
            lastBottom = 0;
        } else {
            const currentTop = highlight.position.boundingRect.y1;
            // Adjust the offset if overlapping or too close to the previous highlight on the same page
            if (currentTop < lastBottom + 10) { // Assuming a 10px minimum gap
                offset = lastBottom - currentTop + 10;
            } else {
            }
        }
        offsets.push({ id: highlight.id, value: offset })
        // Update lastBottom to the current item's bottom including its offset
        lastBottom = highlight.position.boundingRect.y1 + offset + (highlight.position.boundingRect.y2 - highlight.position.boundingRect.y1);
        lastPage = highlight.position.pageNumber; // Update the lastPage to current
    });

    return offsets;
};

export default function PDFView({ pdfBase64, pdfUrl, highlights, handleRemoveHighlight, handleAddHighlight, formatters, parslets }: Props) {


    const pathname = usePathname()
    const router = useRouter()
    const [focusedHighlight, setFocusedHighlight] = useState<{id:string, scroll:boolean} | undefined>()

    const scrollToHighlightFromHash = () => setFocusedHighlight({id: window.location.hash.slice(1), scroll: true});


    useEffect(() => {
        scrollToHighlightFromHash();

        window.addEventListener("hashchange", scrollToHighlightFromHash, false);

        return () => {
            window.removeEventListener("hashchange", scrollToHighlightFromHash, false);
        };
    }, []);


    const resetHash = () => {
        setFocusedHighlight(undefined)
        router.replace(window.location.href.split("#")[0])
    };

    const highlightOffsets = computeOffsets(highlights);


    return (
        <div
            style={{
                height: "100dvh",
                position: "relative",
            }}
        >

            <PdfLoader
                pdfBase64={pdfBase64}
                // url={pdfUrl}
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

                    // console.log("loaded pdf", pdfDocument.numPages)

                    return (
                        <MantineProvider theme={theme}>

                            <PdfHighlighter<Annotation_SB>
                                pdfDocument={pdfDocument}
                                highlights={highlights}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                pdfScaleValue="page-width"
                                // pdfScaleValue=".75"
                                focusedHighlight={focusedHighlight}
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
                                            // onClick={() => setFocusedHighlightId(highlight.id, {scrollTo:false})}
                                            onDelete={() => handleRemoveHighlight(highlight.id)}
                                            isUserHighlight={highlight.is_user}
                                            text={highlight.text}
                                            extractorName={parslets.find(p => p.id === highlight.parslet_id)?.display_name ?? "Unknown"}
                                            setFocusedHighlightId={() => setFocusedHighlight({id:highlight.id, scroll:false})}
                                            offset={highlightOffsets.find(h => h.id === highlight.id)?.value ?? 0}
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