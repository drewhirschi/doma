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
    scrollFiIntoView: (formatterKey:string|null, itemId:number|null) => void
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

    const iconHeight = 32

    const sameHeightMap = new Map<number, Annotation_SB[]>()

    highlights.forEach(h => {
        const top = h.position.boundingRect.y1
        if (sameHeightMap.has(top)) {
            sameHeightMap.get(top)?.push(h)
        } else {
            sameHeightMap.set(top, [h])
        }
    })

    sameHeightMap.forEach((highlights) => {
        const mid = Math.floor(highlights.length / 2) -1;

        for (let i = 0; i <= mid; i++) {
          if (mid - i >= 0) {
            offsets.push({ id: highlights[mid - i].id, value: (i * iconHeight * -1) - (iconHeight / 2) })
          }
          if (mid + i < highlights.length) {
            offsets.push({ id: highlights[mid + i].id, value:( i * iconHeight) + (iconHeight / 2)})
          }
        }
    })



 

    return offsets;
};

export default function PDFView({ pdfBase64, pdfUrl, highlights, handleRemoveHighlight, handleAddHighlight, formatters, parslets, scrollFiIntoView }: Props) {


    const pathname = usePathname()
    const router = useRouter()
    const [focusedHighlight, setFocusedHighlight] = useState<{ id: string, scroll: boolean } | undefined>()

    const scrollToHighlightFromHash = () => setFocusedHighlight({ id: window.location.hash.slice(1), scroll: true });


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
                                    isScrolledTo, 
                                    isContinuationHighlight
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
                                            setFocusedHighlightId={() => {
                                                setFocusedHighlight({ id: highlight.id, scroll: false })
                                                scrollFiIntoView(highlight.formatter_key, highlight.formatter_item_id)
                                            }}
                                            resetFocusedHighlight={() => setFocusedHighlight(undefined)}
                                            offset={highlightOffsets.find(h => h.id === highlight.id)?.value ?? 0}
                                            isContinuationHighlight={isContinuationHighlight}
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