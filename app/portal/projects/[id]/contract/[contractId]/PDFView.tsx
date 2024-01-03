"use client"

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Document, Outline, Page, pdfjs } from 'react-pdf';
import React, { useCallback, useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

function highlightPattern(text: any, pattern: any, addToHighlights: Function) {
    return text.replace(pattern, (value: any) => {
        // addToHighlights(value);  // Call function to add to highlights
        return `<mark>${value}</mark>`;
    });
}

export default function PDFView({ pdfData, httpHeaders, pdfUrl }: { pdfData?: Blob | undefined, httpHeaders: any, pdfUrl: string }) {
    const [searchText, setSearchText] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [highlights, setHighlights] = useState<any[]>([]);  // New state for highlights

    const addHighlight = (text:any) => {
        setHighlights([...highlights, text]);  // Update highlights state
    };

    const textRenderer = useCallback(
        (textItem: any) => highlightPattern(textItem.str, searchText, addHighlight),
        [searchText, highlights]
    );

    function onItemClick({ pageNumber: itemPageNumber }: { pageNumber: number }) {
        setPageNumber(itemPageNumber);
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
      }


    function onChange(event: any) {
        setSearchText(event.target.value);
    }

    return (
        <>
      
            <div>
                <label htmlFor="search">Search:</label>
                <input type="search" id="search" value={searchText} onChange={onChange} />
            </div>
            <Document
                file={pdfUrl} 
                onLoadSuccess={onDocumentLoadSuccess}
                options={{
                    httpHeaders
                }}>
                <Outline
                //   onItemClick={onItemClick}
                />

                {Array.from(
                    new Array(numPages),
                    (el, index) => (
                        // <Page
                        // width={window.innerWidth}
                        //     customTextRenderer={textRenderer}
                        //     key={`page_${index + 1}`}
                        //     pageNumber={index + 1}
                        // />
                        <div>hi</div>
                    ),
                )}
            </Document>
        </>
    );
}