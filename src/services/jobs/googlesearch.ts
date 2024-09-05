import 'dotenv/config'

import axios, { AxiosError } from "axios";

import { CustomSearchResult, } from './googlesearch.types.js';
import { fullAccessServiceClient } from '@/supabase/ServerClients.js';

const engineId = "347b99699576c4846"
const google = axios.create({
    baseURL: 'https://www.googleapis.com/customsearch/v1',
    headers: {
    },
    params: {
        key: process.env.GSEARCH_API_KEY,
        cx: engineId,
    }
})


const supabase = fullAccessServiceClient()


export async function googleSearch(query: string, startIndex = 1): Promise<CustomSearchResult> {


    try {

        const res = await google.get<CustomSearchResult>('/', {
            params: {
                q: query,
                start: startIndex
            }
        })

        return res.data
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const error = e as AxiosError
            console.log("Google search failed", error.status, error.response?.data)
        }
        throw e
    }
}




















