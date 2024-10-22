import axios, { AxiosError } from "axios";
import {
  getCompletion,
  getEmbedding,
  getStructuredCompletion,
} from "./llmHelpers.js";

import axiosRetry from "axios-retry";
import { companyInfoScraping } from "./prompts.js";
import { load } from "cheerio";
import { z } from "zod";
import https from "https";

const axiosInstance = axios.create({
  headers: {
    "User-Agent": "google-bot",
    // 'Accept-Language': 'en-US,en;q=0.9',
    // Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

function tagVisible(element: any) {
  const parentName = element.parent().prop("tagName").toLowerCase();
  const invisibleTags = [
    "style",
    "script",
    "head",
    "title",
    "meta",
    "[document]",
  ];

  if (invisibleTags.includes(parentName)) {
    return false;
  }

  if (element[0].type === "comment") {
    return false;
  }

  return true;
}

export async function getPageContents(url: string) {
  console.log(`Scraping: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`Timed out crawling: ${url}`);
    controller.abort();
  }, 7000);

  try {
    const response = await axiosInstance.get(url, {
      signal: controller.signal,
    });
    const $ = load(response.data);
    const texts = $("*")
      .contents()
      .filter(function () {
        return this.type === "text";
      })
      .filter(function () {
        return tagVisible($(this));
      })
      .text();

    return texts.trim();
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = e as AxiosError;
      console.error(`Error crawling ${url}: ${error}`);
      console.log(error.code, error.message, error.response?.data);
    } else {
      console.error(`Unknow error crawling ${url}: ${e}`);
    }
  } finally {
    console.log("Done scraping", url);
    clearTimeout(timeoutId);
  }
}

const RelevantUrlsResponse = z.object({
  paths: z.array(
    z.object({
      path: z.string(),
      // justification: z.string(),
    }),
  ),
});

const companyProfilesResponse = z.object({
  services: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  locations: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
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
export async function crawlWebsite(
  startUrl: string,
): Promise<Map<string, string>> {
  const visitedUrls: Map<string, string> = new Map();
  const queue: string[] = [startUrl];

  while (queue.length > 0 && visitedUrls.size < 1) {
    const url = queue.pop()!;
    const normalizedUrl = new URL(url).href.replace(/\/$/, "");

    if (visitedUrls.has(normalizedUrl)) continue;

    visitedUrls.set(normalizedUrl, "");

    console.log(`Crawling: ${normalizedUrl}`);

    try {
      const response = await axiosInstance.get(url);
      const $ = load(response.data);
      const baseUrl = new URL(url);

      const title = $("title").text();
      visitedUrls.set(normalizedUrl, title);
      console.log("Title:", title);

      // const text = $('body').text();
      const visibleText = $("body")
        .find("*")
        .contents()
        .filter(function () {
          return (
            this.type === "text" &&
            $(this).closest("script, style").length === 0 &&
            $(this).text().trim().length > 0
          );
        })
        .map(function () {
          return $(this).text().trim();
        })
        .get()
        .join(" ");
      // console.log("Text:", visibleText);

      $("a[href]").each((_, element) => {
        let href = $(element).attr("href");
        if (href && !href.startsWith("http")) {
          href = new URL(href, baseUrl.href).href;
        }
        if (href) {
          href = href.split("#")[0]; // Remove fragment identifiers
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

export async function getPageLinks(
  url: string,
  options?: { limit?: number },
): Promise<Set<string>> {
  const linksSet: Set<string> = new Set();
  const limit = options?.limit || 50; // Set default limit to 50
  const normalizedUrl = new URL(url).href.replace(/\/$/, "");
  linksSet.add(normalizedUrl);

  try {
    const response = await axiosInstance.get(url);
    const $ = load(response.data);
    const baseUrl = new URL(url);

    $("a[href]").each((_, element) => {
      if (linksSet.size >= limit) return false; // Stop if limit is reached

      let href = $(element).attr("href");
      if (href && !href.startsWith("http")) {
        href = new URL(href, baseUrl.href).href;
      }
      if (href) {
        href = href.split("#")[0]; // Remove fragment identifiers
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

export async function indexPage(url: string) {
  // const client = axios.create({
  //   headers: {
  //     "User-Agent": "google-bot",
  //   },
  // });

  const client = axiosInstance;

  axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

  try {
    const response = await client.get(url);
    const $ = load(response.data);

    const title = $("title").text();
    console.log("Title:", title);

    const visibleText = $("body")
      .find("*")
      .contents()
      .filter(function () {
        return (
          this.type === "text" &&
          $(this).closest("script, style").length === 0 &&
          $(this).text().trim().length > 0
        );
      })
      .map(function () {
        return $(this).text().trim();
      })
      .get()
      .join(" ");

    const companyInfo = await getCompletion({
      system: companyInfoScraping,
      user: visibleText,
    });

    const emb = await getEmbedding(
      `Title: ${title}\nPath: ${new URL(url).pathname}`,
    );

    return {
      title,
      emb: emb as unknown as string,
      cmp_info: companyInfo,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      console.error(`Rate limit exceeded for ${url}`);
    } else {
      console.error(`Error indexing ${url}:`, error.message);
    }
  }
}

export async function getFaviconUrl(url: string) {
  try {
    const origin = new URL(url).origin;

    const response = await axiosInstance.get(origin + "/favicon.ico", {
      responseType: "arraybuffer",
    });

    return origin + "/favicon.ico";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
      } else console.log(`Request failed`, error.response?.data);
    } else {
      console.error(`Unknown error getting favicon ${url}:`, error);
    }

    const { data } = await axiosInstance.get(url);
    const $ = load(data);

    const faviconUrl =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href");

    return faviconUrl ? new URL(faviconUrl, url).href : null;
  }
}

export async function getImgs(url: string) {
  const { data } = await axiosInstance.get(url);
  const $ = load(data);

  // Get all img elements
  const images = $("img")
    // @ts-ignore
    .map((i, el) => el.attribs)
    .get();

  return images;
}
export async function getSVGs(url: string) {
  const { data } = await axiosInstance.get(url);
  const $ = load(data);

  const svgData = $("svg")
    .map((_, svg) => {
      const svgElement = $(svg);
      return {
        html: $.html(svgElement), // Get the full HTML of the SVG element
        title: svgElement.find("title").text() || "", // Get the title text or default to an empty string
      };
    })
    .get();

  return svgData;
}

export async function getCompanyName(url: string) {
  const { data } = await axiosInstance.get(url);
  const $ = load(data);

  // Extract relevant content: title, meta, headers, etc.
  const title = $("title").text();
  const metaDescription = $('meta[name="description"]').attr("content");

  const pageText = await getPageContents(url);
  if (!pageText) {
    return null;
  }

  const companyName = await getCompletion({
    system: `You will be provided with content scraped from a webpage of a company's website, your job is to respond with the name of the company and nothing else.`,
    // user: `Title: ${title}\n\nMeta Description: ${metaDescription}\n\nH1: ${h1}`,
    user: `Title: ${title}\n\nMeta Description: ${metaDescription}\n\nContent: ${pageText}`,
  });

  return companyName;
}

//-----------------ARTICLE CRAWLING FUNCTIONS-----------------//

// Function to get the contents of an article from a URL
export async function getArticleContents(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`Timed out crawling: ${url}`);
    controller.abort();
  }, 15000);

  try {
    const response = await axiosInstance.get(url, {
      signal: controller.signal,
    });

    const $ = load(response.data);

    // Try common article tags with expanded selectors for robustness
    let articleText =
      $("article").text() ||
      $("main").text() ||
      $('[class*="article"]').text() ||
      $('[id*="article"]').text() ||
      $('[class*="content"]').text() ||
      $('[id*="content"]').text();

    // If no article-like elements are found, fallback to getting the largest block of text
    if (!articleText || articleText.trim().length < 100) {
      articleText = getLargestTextBlock($);
    }

    return articleText.trim();
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = e as AxiosError;
      console.error(`Error crawling ${url}: ${error}`);
      console.log(error.code, error.message, error.response?.data);
    } else {
      console.error(`Unknown error crawling ${url}: ${e}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

// Helper function to get the largest block of text from the page
function getLargestTextBlock($: any): string {
  let maxLength = 0;
  let largestText = "";

  // Iterate over elements and exclude common non-content tags
  $("body *:not(nav):not(footer):not(header):not([class*='sidebar'])").each(
    function (this: HTMLElement) {
      const elementText = $(this).text().trim();

      // Skip non-visible elements
      if (!articleTagVisible($(this))) {
        return;
      }

      if (elementText.length > maxLength) {
        maxLength = elementText.length;
        largestText = elementText;
      }
    },
  );

  return largestText;
}

// Function to check if a tag is visible
function articleTagVisible(element: any): boolean {
  return (
    element.css("display") !== "none" && element.css("visibility") !== "hidden"
  );
}

// function to check if the article is relevant
export async function isArticleRelevant(
  articleUrl: string | null,
  articleTitle: string | null,
  companyName: string | null,
  pageText: string | null,
) {
  try {
    const { data } = await axiosInstance.get(articleUrl || "");
    const $ = load(data);
    const metaDescription = $('meta[name="description"]').attr("content");

    if (!pageText) {
      return false;
    }

    const gptResponse = await getCompletion({
      system: `You will be provided with content scraped from an article. 
      Your job is to decide if the article is both about the company - '${companyName}' - and about an acquisition involving this company.
       Respond simply with true or false.`,
      user: `Title: ${articleTitle}\n\nMeta Description: ${metaDescription}\n\nContent: ${pageText}`,
    });

    return gptResponse?.toLowerCase().includes("true");
  } catch (error) {
    console.error("Error scraping article:", error);
    return false;
  }
}

// Function to create a summary of an article using GPT
export async function summarizeArticle(title: string, pageText: string) {
  const gptResponse = await getCompletion({
    system: `You will be provided with content from an article. Summarize the article in 2-3 sentences in a concise and clear manner.`,
    user: `Title: ${title}\n\nContent: ${pageText}`,
  });

  return gptResponse;
}

// Transaction schema
const transactionSchema = z.object({
  buyer: z.string(),
  seller: z.string(),
  backer: z.string(),
  amount: z.string(),
  date: z.string(),
  reason: z.string(),
  description: z.string(),
});

// Function to extract transaction details from an article using GPT
export async function extractTransactionDetails(
  title: string,
  pageText: string,
) {
  const transaction = await getStructuredCompletion({
    system: `Extract, if found, the buyer, seller, backer, amount, transaction date, and acquisition reason from the article and create a transaction report.
    Then, create a brief description of the transaction with the non null values in this format: "Company A acquired Company B for $X million on DATE, backed by Company C for REASON."`,
    user: `Title: ${title}\n\nContent: ${pageText}`,
    schema: transactionSchema,
  });

  return transaction;
}

// RPC function to compare new transaction with existing transactions
export async function compareTransactions(
  newEmbedding: number[],
  pageText: string,
) {
  // call the rpc to compare the new transaction with existing transactions and return the 10 most similar transactions

  // then get the article text for the 10 transactions and use gpt to see if they are really the same transaction

  return false;
}

// TODO: Function to check if a each company associated with the transaction is in the database
