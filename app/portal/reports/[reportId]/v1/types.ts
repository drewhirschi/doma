import { ContentsOptions, SearchResult } from "exa-js";

export interface ISection {
  name: string;
  intr: string;
  queries?: string[];
  searchResults?: SearchResult<ContentsOptions>[];
  summaries?: { url: string; text: string | null }[];
  md?: string | null;
}

export interface PexelPhoto {
  // id: number;
  // width: number;
  // height: number;
  url: string;
  // photographer: string;
  // photographer_url: string;
  // photographer_id: number;
  // avg_color: string;
  // src: PexelPhotoSrc;
  // liked: boolean;
  alt: string;
  category?: string;
}

export interface PexelPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

type ISO8601Date = string;

export interface ExaSearchParams {
  query: string;
  useAutoprompt?: boolean;
  type?: "keyword" | "neural" | "auto";
  category?:
    | "company"
    | "research paper"
    | "news"
    | "github"
    | "tweet"
    | "movie"
    | "song"
    | "personal site"
    | "pdf";
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  startCrawlDate?: ISO8601Date;
  endCrawlDate?: ISO8601Date;
  startPublishedDate?: ISO8601Date;
  endPublishedDate?: ISO8601Date;
  includeText?: string[];
  excludeText?: string[];
  contents?: {
    text?: {
      maxCharacters?: number;
      includeHtmlTags?: boolean;
    };
    highlights?: {
      numSentences?: number;
      highlightsPerUrl?: number;
      query?: string;
    };
    summary?: {
      query?: string;
    };
  };
}
