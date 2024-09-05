import { Job, Queue } from "bullmq";

import Exa from 'exa-js'
import { fullAccessServiceClient } from "@/supabase/ServerClients.js";
import { getStructuredCompletion } from "../llmHelpers.js";
import { googleSearch } from "../googlesearch.js";
import { z } from "zod";

export async function companyDiscovery(job: Job) {
    const sb = fullAccessServiceClient();
    const modelCmpId = job.data.cmpId; // startUrl
    if (!modelCmpId) {
        throw new Error("Property 'cmpId' is required in data payload");
    }

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
        system: "List 5 few-word-descriptions of what the company does based on their products and services",
        user: cmp.web_summary!,
        schema: SearchQuerySchema,
    })

    if (!queriesRes) {
        throw new Error("Failed to get structured completion for search queries");
    }

    console.log(queriesRes?.queries)
    // return
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

    const insert = await sb.from('company_profile').upsert(searchRes.map(item => ({origin: item.url})), { ignoreDuplicates: true, onConflict: 'origin' }).select()


    if (insert.error) {
        console.error(insert.error)
        throw insert.error
    }

    console.log(insert.data)



    const industryQueue = new Queue('industry');

    for (const item of insert.data) {
        await industryQueue.add('scrape_company_website', { url: item.origin });

    }
    await industryQueue.close()



    return "completed"
}