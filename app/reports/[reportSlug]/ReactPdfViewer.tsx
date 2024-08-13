"use client"

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { AppShell, Burger, Group, Paper, ScrollArea, Skeleton, Stack } from '@mantine/core';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDisclosure, useScrollIntoView } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';

import { browserClient } from '@/supabase/BrowserClient';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


export function ReactPdfViewer({ reportId }: { reportId: number }) {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);


    const [pdfData, setPdfData] = useState([])
    const [fileUrl, setFileUrl] = useState<string | undefined>()
    const [opened, { toggle }] = useDisclosure();

    useEffect(() => {
        const supabase = browserClient();

        supabase.from("reports").select("*").eq("id", reportId).single().then(res => {
            if (res.error) {
                console.error(res.error);
                return;
            }
            if (res.data?.file_path)
                supabase.storage.from("tenants").createSignedUrl(res.data?.file_path, 3600).then(res => {
                    setFileUrl(res.data?.signedUrl);
                });
        });
    }, [reportId]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                const visiblePages = entries
                    .filter(entry => entry.isIntersecting)
                    //@ts-ignore this is available bc of the data-page-number attribute
                    .map(entry => parseInt(entry.target.dataset.pageNumber));
                setVisiblePages(visiblePages);
            },
            { threshold: 0 } // Adjust this threshold as needed
        );

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        pageRefs.current.forEach((ref, index) => {
            if (ref && observerRef.current) {
                observerRef.current.observe(ref);
            }
        });
    }, [numPages]);

    const scrollToPage = (pageNumber: number) => {
        const pageRef = pageRefs.current[pageNumber - 1];
        if (pageRef) {
            const offset = 80; // Adjust this value based on your needs
            const elementPosition = pageRef.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };


    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    return (
        // <div>

        //     <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}  >
        //         <Page pageNumber={pageNumber} />
        //     </Document>
        //     <p>
        //         Page {pageNumber} of {numPages}
        //     </p>
        // </div>
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            // aside={{ width: 300, breakpoint: 'md', collapsed: { desktop: false, mobile: true } }}
            // footer={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    {JSON.stringify(visiblePages)}
                </Group>
            </AppShell.Header>
            <AppShell.Navbar bg={"dark.3"} p="md">
                <ScrollArea scrollbarSize={"xs"} >

                    <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}  >
                        <Stack align='center'>

                            {Array(numPages)
                                .fill(0)
                                .map((_, index) => (
                                    <Paper shadow='sm' mb={'sm'}
                                        onClick={() => scrollToPage(index + 1)}
                                        key={index} maw={"min-content"}>

                                        <Page pageNumber={index + 1} width={160} />
                                    </Paper>

                                ))}
                        </Stack>
                    </Document>
                </ScrollArea>
            </AppShell.Navbar>
            <AppShell.Main bg={"dark.1"}>
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}  >
                    <Stack align='center'>


                        {Array(numPages)
                            .fill(0)
                            .map((_, index) => (
                                <Paper
                                    shadow='sm'
                                    mb={'sm'}
                                    ref={(el) => pageRefs.current[index] = el}
                                    key={index}
                                    maw={"min-content"}
                                    data-page-number={index + 1}
                                >
                                    <Page pageNumber={index + 1} />
                                </Paper>

                            ))}
                    </Stack>
                </Document>
            </AppShell.Main>
            {/* <AppShell.Aside p="md">Aside</AppShell.Aside> */}
            {/* <AppShell.Footer p="md">Footer</AppShell.Footer> */}
        </AppShell>
    );
}