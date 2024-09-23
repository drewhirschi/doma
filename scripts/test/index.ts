import { getEmbedding, getStructuredCompletion } from "@/backend/services/jobs/llmHelpers";

import { Queue } from "bullmq";
import { TransactionExtractionSchema } from "@/backend/services/jobs/googlesearch.types";
import { fullAccessServiceClient } from "@/shared/supabase-client/ServerClients";
import { getPageContents } from "@/backend/services/jobs/webHelpers";

async function main() {


    const queue = new Queue('industry')

    const sb = fullAccessServiceClient()
    const insert = await sb.from("transaction_search_res").select().order("id", { ascending: false }).eq("linked", false).limit(10)

    if (insert.error) {
        console.log("failed to get trans search res", insert.error)
        throw insert.error
    }

    await queue.addBulk(insert.data?.map(transaction => ({
        name: "transaction_linking",
        data: {
            trans_news_id: transaction.id,
        }
    })) ?? [])


    
    console.log("DONE")


}

main()