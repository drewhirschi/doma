'use server'

import { getEmbedding } from "@/shared/llmHelpers"
import { serverActionClient } from "@/shared/supabase-client/server"
import { redirect } from "next/navigation"

export async function createSearch(formdata: FormData) {
    const supabase = serverActionClient()

    const query = formdata.get('query')
    if (!query) {
        throw new Error('No search')
    }
    const emb = await getEmbedding(query as string)
    const insertSearch = await supabase.from('searches').insert({ query: query as string, emb: JSON.stringify(emb) }).select().single()

    if (insertSearch.error) {
        throw insertSearch.error
    }


    return redirect('/portal/search/' + insertSearch.data?.id)

}