import { z } from "zod";

export type SearchResultItem = {
    kind: "customsearch#result";
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    formattedUrl: string;
    htmlFormattedUrl: string;
    pagemap: any;
}

export type CustomSearchResult = {
    kind: "customsearch#search";
    url: {
        type: string;
        template: string;
    };
    queries: {
        request: Array<{
            title: string;
            totalResults: string;
            searchTerms: string;
            count: number;
            startIndex: number;
            inputEncoding: string;
            outputEncoding: string;
            safe: string;
            cx: string;
        }>;
        nextPage?: Array<{
            title: string;
            totalResults: string;
            searchTerms: string;
            count: number;
            startIndex: number;
            inputEncoding: string;
            outputEncoding: string;
            safe: string;
            cx: string;
        }>;
    };
    context: {
        title: string;
    };
    searchInformation: {
        searchTime: number;
        formattedSearchTime: string;
        totalResults: string;
        formattedTotalResults: string;
    };
    items: SearchResultItem[];
};

export const InvolvedParty = z.object({
    name: z.string(),
    role: z.string(),
})

export const TransactionExtractionSchema = z.object({
    is_transaction_article: z.boolean(),
    transactions: z.array(
        z.object({
            buyer_name: z.string(),
            seller_name: z.string(),
            seller_details: z.string(),
            description: z.string(),
            reason: z.string(),
            date: z.string(),
            article_date: z.string(),
            others: z.array(InvolvedParty)
        })

    ),
})

