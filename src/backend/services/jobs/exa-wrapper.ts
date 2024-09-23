// src/exa-wrapper.ts

import 'dotenv/config'

import { BaseSearchOptions, ContentsOptions, SearchResponse, SearchResult, } from "exa-js";
import axios, { AxiosError } from "axios";

import { getPageContents } from './webHelpers.js';
import { getStructuredCompletion } from './llmHelpers.js';
import { z } from 'zod';

const exa = axios.create({
    baseURL: 'https://api.exa.ai',
    headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': process.env.EXA_API_KEY,
    },
})

// https://docs.exa.ai/reference/contents
export async function getContents(urls: string[]): Promise<SearchResponse<ContentsOptions>> {

    try {

        const res = await exa.post<SearchResponse<ContentsOptions>>('/contents', {
            ids: urls
        })

        return res.data
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const error = e as AxiosError
            console.log("exa get contrents failed", error.status,error.response?.data)
        }
        throw e
    }
}
export async function keywordSearch(query: string): Promise<SearchResponse> {

    try {

        const res = await exa.post<SearchResponse>('/search', {
            query,
            type: 'keyword',
            numResults: 20, 
            category: ''

        } as BaseSearchOptions)

        return res.data
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const error = e as AxiosError
            console.log("exa search failed", error.status,error.response?.data)
        }
        throw e
    }
}








