import { Job, Queue } from "bullmq";
import { getEmbedding, getStructuredCompletion } from "../llmHelpers.js";

import { TransactionExtractionSchema } from "../googlesearch.types.js";
import { fullAccessServiceClient } from "@/supabase/ServerClients.js";
import { getPageContents } from "../webHelpers.js";
import { googleSearch } from "../googlesearch.js";
import { isNotNull } from "@/utils/typeHelpers.js";

const queue = new Queue('industry');

export async function transactionDiscovery(job: Job) {
    console.log('job data', job.data)

    const supabase = fullAccessServiceClient()

     const searchQuery = job.data.industry + "mergers and acquisitions";
    const searchResults = await Promise.all([
        googleSearch(searchQuery, 1),
        googleSearch(searchQuery, 11),
        googleSearch(searchQuery, 21),
        googleSearch(searchQuery, 31),
        // googleSearch(searchQuery, 41),
        // googleSearch(searchQuery, 91),
    ])

    const items = searchResults.flatMap(res => res.items)
        .filter(item => item.link)
        .filter(item => !item.link.includes(".pdf"))
        // .slice(3, 4)

    // console.log(items.map((item, index) => item))

    const scrapeProms = items.map(async item => {

        const pageText = await getPageContents(item.link)

        if (!pageText) {
            return null
        }

        const transactionsDescription = await getStructuredCompletion({
            system: `Extract anything about M&A transactions mentioned in the article. There may not be specific transactions.
    Use the article text as context. 
    Extract:
     the buyer name,
     the seller name,
     anything else mentioned about the seller,
    the reasoning for the transaction, 
    others -> names of other companies involved and their role like advisor or pe_backer, 
    a date for when the article in the format YYYY/MM/DD,
    a date for the transaction in the format YYYY/MM/DD, 
    (make sure to use slaches for the dates),
    a short description in the format [buyerName] mergers with/acquires/invest in [sellerName].`,
            user: pageText,
            schema: TransactionExtractionSchema
        }).catch(e => {
            console.log("Failed to parse ", item.link, e)
            return null
        })

        if (!transactionsDescription) {
            return null
        }


        const embProms = transactionsDescription.transactions.map(async (td) => {

            return await getEmbedding(td.description)
        })


        const embs = await Promise.all(embProms)

        return transactionsDescription.transactions.map((td, index) => {

            return {
                ...td,
                url: item.link,
                title: item.title,
                snippet: item.snippet,
                emb: JSON.stringify(embs[index])
            }
        })
    })


    const transactions = (await Promise.all(scrapeProms)).filter(res => res != null).flat().filter(isNotNull)
    // transactions.map(transaction => console.log({...transaction, emb: undefined}))

    const insert = await supabase.from("transaction_search_res").insert(transactions).select()

    if (insert.error) {
        console.log("Failed to insert", insert.error)
        throw insert.error
    } 

    await queue.addBulk(insert.data?.map(transaction => ({
        name: "transaction_linking",
        data: {
            trans_news_id: transaction.id,
        }
    })) ?? [])


    return "job result"
}