import { Queue, SandboxedJob } from "bullmq";
import { getCompanyName, getFaviconUrl, getImgs, getPageLinks, getSVGs, indexPage } from "../webHelpers.js";
import { getCompletion, getEmbedding, getStructuredCompletion, recursiveDocumentReduction } from "../llmHelpers.js";

import { IndustryQueueClient } from "../industry-queue.js";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { isNotNull } from "@shared/types/typeHelpers";

export async function scrapeCompanyWebsite(job: SandboxedJob) {

    const companyWebsite = new URL(job.data.url).origin; // startUrl
    if (!companyWebsite) {
        throw new Error("Property 'url' is required in data payload");
    }

    const supabase = fullAccessServiceClient()

    let company: CompanyProfile_SB
    const companyGet = await supabase.from("company_profile").select().eq("origin", companyWebsite);
    if (companyGet.error) {
        throw companyGet.error;
    } else if (companyGet.data.length > 0) {
        // console.log("company already exists", companyGet.data[0].id)

        company = companyGet.data[0]

        if (company.web_summary) {
            console.log("web summary already exists", company.origin)
            return "already indexed"
        }
    } else {
        const createCompany = await supabase.from("company_profile").insert({
            origin: companyWebsite,
        }).select().single()

        if (createCompany.error) {
            throw createCompany.error
        }

        company = createCompany.data

    }

    const [companyName, favicon] = await Promise.all([getCompanyName(companyWebsite), getFaviconUrl(companyWebsite)])
    if (favicon || companyName) {
        await supabase.from("company_profile").update({ favicon, name: companyName }).eq("id", company.id!)
    }


    const pagesUrls = Array.from(await getPageLinks(companyWebsite, { limit: 50 }))

    const pagesGet = await supabase.from("comp_pages").select().in("url", pagesUrls)

    const pagesToIndex = pagesUrls.filter(page => {
        const dbPage = pagesGet.data?.find(p => p.url === page)
        if (!dbPage) {
            return true
        }

        return dbPage.cmp_info == null

    })

    console.log("indexing pages", pagesToIndex.join("\n"))
    // return

    const scrapeProms = pagesToIndex.map(async (page) => {
        const indexResults = await indexPage(page)

        if (!indexResults) {
            console.warn("Failed to index", page)
        }

        const upsert = await supabase.from("comp_pages")
            .upsert({ ...indexResults, company_id: company.id!, url: page })
            .select()
            .single()

        if (upsert.error) {
            throw upsert.error
        }

        return upsert.data
    });
    const indexedPages = await Promise.all(scrapeProms);


    const industryQueue = new IndustryQueueClient();
    await industryQueue.scrapeLogo(company.id)
    await industryQueue.reduceCompanyPages(company.id)
    await industryQueue.close()

    return company.id
}

export function weightedAverage(
    vectorA: number[],
    vectorB: number[],
    weightA: number,
    weightB: number
): number[] {
    if (vectorA.length !== vectorB.length) {
        throw new Error("Vectors must be of the same length");
    }

    const weightedSum: number[] = vectorA.map((a, i) => (a * weightA) + (vectorB[i] * weightB));
    const totalWeight = weightA + weightB;

    return weightedSum.map(value => value / totalWeight);
}


export async function reduceCompanyPagesToProfile(job: SandboxedJob) {
    const supabase = fullAccessServiceClient()
    const { cmpId } = job.data

    if (!cmpId) {
        throw new Error("Property 'cmpId' is required in data payload");
    }

    const companyGet = await supabase.from("company_profile").select("*, comp_pages(*)").eq("id", cmpId).single();

    if (companyGet.error) {
        throw companyGet.error
    }


    if (companyGet.data.web_summary) {
        console.log("web summary already exists", cmpId)
        return
    }

    const indexedPages = companyGet.data.comp_pages



    const companySummary = await recursiveDocumentReduction({
        documents: indexedPages.map(ip => ip.cmp_info).filter(isNotNull),
        instruction: `The following info is important:
- What industry the company is in
- Their bussiness model, how do they generate revenue, what are their core products, services, and target markets,
- Size, how many employees they have, how many assets they have
- What stage are they in: start up, small business, mid-sized, enterprise, etc
- Geographic Presence: Consider where they operate and their market share in those regions`
    })
    const summaryEmb = await getEmbedding(companySummary)

    const businessModel = await getCompletion({
        system: "extract what products and services the company offers",
        user: companySummary
    })

    if (businessModel == null) {
        throw new Error("failed to get business products and services")
    }

    const bmEmb = await getEmbedding(businessModel)


    const emb = weightedAverage(summaryEmb, bmEmb, 1, 9)



    const update = await supabase.from("company_profile")
        .update({ web_summary: companySummary, web_summary_emb: JSON.stringify(emb) })
        .eq("id", cmpId)
    if (update.error) {
        throw update.error
    }

}


