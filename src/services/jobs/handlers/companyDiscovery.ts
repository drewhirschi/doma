import { Job, Queue } from "bullmq";

import Exa from 'exa-js'
import { fullAccessServiceClient } from "@/supabase/ServerClients.js";
import { getStructuredCompletion } from "../llmHelpers.js";
import { googleSearch } from "../googlesearch.js";
import { z } from "zod";

export async function companyDiscovery(job: Job) {
    const modelCmpId = job.data.cmpId; // startUrl
    if (!modelCmpId) {
        throw new Error("Property 'cmpId' is required in data payload");
    }

    const sb = fullAccessServiceClient();
    const cmpGet = await sb.from("company_profile").select().eq("id", modelCmpId).single();
    if (cmpGet.error) {
        throw cmpGet.error;
    } else if (!cmpGet.data.web_summary) {
        throw new Error("Model Company summary not found");
    }

    const cmp = cmpGet.data;

    const SearchQuerySchema = z.object({
        queries: z.array(z.string())
    });

    const queriesRes = await getStructuredCompletion({
        model: "gpt-4o-2024-08-06",
        system: "List 3 few-word-descriptions of what the company does based on their products and services",
        user: cmp.web_summary!,
        schema: SearchQuerySchema,
    })

    if (!queriesRes) {
        throw new Error("Failed to get structured completion for search queries");
    }

    console.log(queriesRes?.queries)
    const exa = new Exa(process.env.EXA_API_KEY)

    const searchProms = queriesRes.queries
        // .slice(0, 1)
        .map(async query => {

            // const searchResults = await Promise.all([
            //     googleSearch(query + " companies", 1),
            //     // googleSearch(query, 11),
            //     // googleSearch(query, 21),

            // ])
            // const flatResults = searchResults.flatMap(res => res.items)
            //     .filter(item => !!item.link)
            //     .filter(item => !item.link.includes(".pdf"))

            // return flatResults

            return await exa.search(query, {
                type: "neural",
                useAutoprompt: true,
                numResults: 25,
                category: "company",

            })
        })

    const searchRes = (await Promise.all(searchProms)).flatMap(res => res.results)


    const searchResMap = new Map()
    searchRes.forEach(item => {
        const origin = new URL(item.url).origin
        console.log({ name: item.title, origin })
        searchResMap.set(origin, item)
    })
    console.log(`Got ${searchRes.length} search results`)
    const industryQueue = new Queue('industry');

    for (const [key, value] of searchResMap) {
        await industryQueue.add('scrape_company_website', { url: value.url });

    }
    await industryQueue.close()



    return "job result"
}