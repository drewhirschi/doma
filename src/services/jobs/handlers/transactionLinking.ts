import 'dotenv/config'

import { CustomSearchResult, InvolvedParty, TransactionExtractionSchema } from '../googlesearch.types.js';
import { Job, Queue } from 'bullmq';

import { fullAccessServiceClient } from '@/supabase/ServerClients.js';
import { googleSearch } from '../googlesearch.js';
import { z } from 'zod';

const supabase = fullAccessServiceClient()

export async function transactionCompanyLinking(job: Job) {

    const id = job.data.trans_news_id



    const transactionsGet = (await supabase.from("transaction_search_res").select().eq("id", id).single())


    if (transactionsGet.error) {
        throw transactionsGet.error
    }

    const transaction = transactionsGet.data

    const companyProfileProms = [
        { trans_id: id, name: transaction.buyer_name, role: "buyer" },
        { trans_id: id, name: transaction.seller_name, role: "seller" },
        ...(transaction.others as [])?.map((other: z.infer < typeof InvolvedParty>) => ({ trans_id: id, name: other.name, role: other.role })),
    ]
        .filter(x => !!x.name)
        .map(async involvedParty => {

            const websiteUrl = (await googleSearch(`${involvedParty.name} website`)).items[0].link

            return {
                ...involvedParty,
                websiteOrigin: new URL(websiteUrl).origin
            }


        })


    const companyProfiles = await Promise.all(companyProfileProms)
    const industryQueue = new Queue('industry');

    companyProfiles.map(async profile => {

        let companyId = 0
        const companyCheck = await supabase.from("company_profile").select().eq("website", profile.websiteOrigin).limit(1)


        if (companyCheck.error) {
            throw companyCheck.error
        }

        if (companyCheck.data?.length === 0) {
            const insert = await supabase.from("company_profile").insert({ name: profile.name, website: profile.websiteOrigin }).select()
            if (insert.error) {
                throw insert.error
            }
            companyId = insert.data[0].id
        } else {
            companyId = companyCheck.data[0].id
        }

        const createRelation = await supabase.from("transaction_participant").insert({ trans_id: profile.trans_id, cmp_id: companyId, role: profile.role }).select()


        if (createRelation.error) {
            throw createRelation.error
        }

        await industryQueue.add('scrape_company_website', { cmpId: companyId });
        
    })
    
    await industryQueue.close()

    



}

