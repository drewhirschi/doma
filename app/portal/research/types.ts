import { ContentsOptions, SearchResult } from "exa-js"

export interface ISection {
    name: string
    intr: string
    queries?: string[]
    searchResults?: SearchResult<ContentsOptions>[]
    summaries?: { url: string, text: string | null }[]
    md?: string | null
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