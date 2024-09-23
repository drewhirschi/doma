import axios, { AxiosError } from "axios";
import { getCompletion, getEmbedding } from "./llmHelpers.js";

import { load } from 'cheerio';
import { z } from "zod";

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'google-bot',
        // 'Accept-Language': 'en-US,en;q=0.9',
        // Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
    }
})

function tagVisible(element: any) {
    const parentName = element.parent().prop('tagName').toLowerCase();
    const invisibleTags = ['style', 'script', 'head', 'title', 'meta', '[document]'];

    if (invisibleTags.includes(parentName)) {
        return false;
    }

    if (element[0].type === 'comment') {
        return false;
    }

    return true;
}


export async function getPageContents(url: string) {
    console.log(`Scraping: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.warn(`Timed out crawling: ${url}`);
        controller.abort()
    }, 7000);

    try {
        const response = await axiosInstance.get(url, {
            signal: controller.signal,
        });
        const $ = load(response.data);
        const texts = $('*').contents().filter(function () {
            return this.type === 'text';
        }).filter(function () {
            return tagVisible($(this));
        }).text();

        return texts.trim();
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const error = e as AxiosError
            console.error(`Error crawling ${url}: ${error}`);
            console.log(error.code, error.message, error.response?.data)
        } else {

            console.error(`Unknow error crawling ${url}: ${e}`);
        }
    } finally {
        console.log('Done scraping', url);
        clearTimeout(timeoutId);
    }
}


const RelevantUrlsResponse = z.object({
    paths: z.array(z.object({
        path: z.string(),
        // justification: z.string(),
    })),

});

const companyProfilesResponse = z.object({
    services: z.array(z.object({
        name: z.string(),
        description: z.string(),
    })),
    locations: z.array(z.object({
        name: z.string(),
        description: z.string(),
    })),
});

// Function to check if a URL is valid and belongs to the base domain
function isValidUrl(url: string, baseUrl: URL): boolean {
    try {
        const parsedUrl = new URL(url, baseUrl.href);
        return parsedUrl.origin === baseUrl.origin;
    } catch (error) {
        return false;
    }
}



// Function to crawl a website starting from the given URL
export async function crawlWebsite(startUrl: string): Promise<Map<string, string>> {
    const visitedUrls: Map<string, string> = new Map();
    const queue: string[] = [startUrl];


    while (queue.length > 0 && visitedUrls.size < 1) {
        const url = queue.pop()!;
        const normalizedUrl = new URL(url).href.replace(/\/$/, "");

        if (visitedUrls.has(normalizedUrl)) continue;

        visitedUrls.set(normalizedUrl, "");


        console.log(`Crawling: ${normalizedUrl}`);

        try {
            const response = await axios.get(url);
            const $ = load(response.data);
            const baseUrl = new URL(url);

            const title = $("title").text();
            visitedUrls.set(normalizedUrl, title);
            console.log("Title:", title);

            // const text = $('body').text();
            const visibleText = $('body').find('*').contents()
                .filter(function () {
                    return this.type === 'text' && $(this).closest('script, style').length === 0 && $(this).text().trim().length > 0;
                })
                .map(function () {
                    return $(this).text().trim();
                })
                .get()
                .join(' ');
            // console.log("Text:", visibleText);

            $('a[href]').each((_, element) => {
                let href = $(element).attr('href');
                if (href && !href.startsWith('http')) {
                    href = new URL(href, baseUrl.href).href;
                }
                if (href) {
                    href = href.split('#')[0]; // Remove fragment identifiers
                    href = new URL(href).href.replace(/\/$/, ""); // Normalize URL
                    if (isValidUrl(href, baseUrl) && !visitedUrls.has(href)) {
                        queue.push(href);
                        console.log("Enqueued:", new URL(href).pathname);
                    }
                }
            });
        } catch (error: any) {
            console.error(`Error crawling ${url}:`, error.message);
        }
    }

    return visitedUrls;
}


export async function getPageLinks(url: string, options?: { limit?: number }): Promise<Set<string>> {
    const linksSet: Set<string> = new Set();
    const limit = options?.limit || 50; // Set default limit to 50
    const normalizedUrl = new URL(url).href.replace(/\/$/, "");
    linksSet.add(normalizedUrl);

    try {
        const response = await axios.get(url);
        const $ = load(response.data);
        const baseUrl = new URL(url);

        $('a[href]').each((_, element) => {
            if (linksSet.size >= limit) return false; // Stop if limit is reached

            let href = $(element).attr('href');
            if (href && !href.startsWith('http')) {
                href = new URL(href, baseUrl.href).href;
            }
            if (href) {
                href = href.split('#')[0]; // Remove fragment identifiers
                href = new URL(href).href.replace(/\/$/, ""); // Normalize URL
                if (isValidUrl(href, baseUrl)) {
                    linksSet.add(href);
                }
            }
        });
    } catch (error: any) {
        console.error(`Error getting links from ${url}:`, error.message);
    }

    return linksSet;
}


export async function indexPage(url: string, options?: { retries?: number }) {
    try {
        const response = await axios.get(url);
        const $ = load(response.data);

        const title = $("title").text();
        console.log("Title:", title);

        const visibleText = $('body').find('*').contents()
            .filter(function () {
                return this.type === 'text' && $(this).closest('script, style').length === 0 && $(this).text().trim().length > 0;
            })
            .map(function () {
                return $(this).text().trim();
            })
            .get()
            .join(' ');




        const companyInfo = await getCompletion({
            system: `You will be provided with content scraped from a webpage of a company's website, your job is to respond with any details about the company. 
We are looking for data that helps us understand
- What industry the company is in
- Their bussiness model, how do they generate revenue, what are their core products and services and how much do they cost; their target markets and any customers listed, 
- Size, how many employees they have, how many assets they have
- What stage are they in: start up, small business, mid-sized, enterprise, etc
- Geographic Presence: Consider where they operate and their market share in those regions`
            ,
            user: visibleText,
        })


        const emb = await getEmbedding(`Title: ${title}\nPath: ${new URL(url).pathname}`)

        return {
            title,
            emb: emb as unknown as string,
            cmp_info: companyInfo

        }





    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
            if (options?.retries === undefined || options?.retries === 0) {
                console.warn(`Rate limit exceeded for ${url}, waiting 0.5 seconds and retrying`)
                await new Promise(resolve => setTimeout(resolve, 500));
                return indexPage(url, { retries: (options?.retries ?? 0) + 1 });
            }
        } else {

            console.error(`Error indexing ${url}:`, error.message);
        }

    }
}


export async function getFaviconUrl(url: string) {

    const origin = new URL(url).origin

    try {
        const { data } = await axios.get(origin + "/favicon.ico", {
            responseType: "arraybuffer"
        });

        return origin + "/favicon.ico"

    } catch (error) {

        const { data } = await axios.get(url);
        const $ = load(data);

        const faviconUrl = $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            $('link[rel="apple-touch-icon"]').attr('href');

        return faviconUrl ? new URL(faviconUrl, url).href : null;
    }


}

async function getLogo(url: string) {
    const { data } = await axios.get(url);
    const $ = load(data);

    const logoUrl = $('.logo')
    // .attr('src');
    //  || $('img[alt*="logo"]').attr('src') 

    console.log(logoUrl)
    // return logoUrl ? new URL(logoUrl, url).href : null;
}

export async function getCompanyName(url: string) {
    const { data } = await axios.get(url);
    const $ = load(data);

    // Extract relevant content: title, meta, headers, etc.
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content');
    const h1 = $('h1').text();

    const companyName = await getCompletion({
        system: `You will be provided with content scraped from a webpage of a company's website, your job is to respond with the name of the company and nothing else.`,
        user: `Title: ${title}\n\nMeta Description: ${metaDescription}\n\nH1: ${h1}`
    })

    return companyName

}