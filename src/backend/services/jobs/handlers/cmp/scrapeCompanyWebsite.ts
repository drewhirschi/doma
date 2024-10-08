import {
    getCompanyName,
    getFaviconUrl,
    getPageLinks,
    indexPage,
} from "../../webHelpers.js";

import { IndustryQueueClient } from "@shared/queues/industry-queue.js";
import { SandboxedJob } from "bullmq";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { scrapeWebsiteSchema } from "@shared/queues/industry-queue.types.js";
import { z } from "zod";

const addProtocolIfNeeded = (url: string) => {
    // Check if the URL already starts with a protocol (http:// or https://)
    const hasProtocol = /^https?:\/\//i.test(url);
    return hasProtocol ? url : `https://${url}`;
};
export async function scrapeCompanyWebsite(job: SandboxedJob<z.infer<typeof scrapeWebsiteSchema>>) {
    const companyWebsite = new URL(addProtocolIfNeeded(job.data.url)).origin; // startUrl
    if (!companyWebsite) {
        throw new Error("Property 'url' is required in data payload");
    }

    const supabase = fullAccessServiceClient();

    let company: CompanyProfile_SB;
    const companyGet = await supabase
        .from("company_profile")
        .select()
        .eq("origin", companyWebsite);
    if (companyGet.error) {
        throw companyGet.error;
    } else if (companyGet.data.length > 0) {
        // console.log("company already exists", companyGet.data[0].id)

        company = companyGet.data[0];

        if (company.web_summary && !job.data.force) {
            console.log("web summary already exists", company.origin);
            return "already indexed";
        }
    } else {
        const createCompany = await supabase
            .from("company_profile")
            .insert({
                origin: companyWebsite,
            })
            .select()
            .single();

        if (createCompany.error) {
            throw createCompany.error;
        }

        company = createCompany.data;
    }

    const [companyName, favicon] = await Promise.all([
        getCompanyName(companyWebsite),
        getFaviconUrl(companyWebsite).catch(() => null),
    ]);

    if (favicon || companyName) {
        await supabase
            .from("company_profile")
            .update({ favicon, name: companyName })
            .eq("id", company.id!);
    }

    const pagesUrls = Array.from(
        await getPageLinks(companyWebsite, { limit: 50 }),
    );

    const pagesGet = await supabase
        .from("comp_pages")
        .select()
        .in("url", pagesUrls);

    const pagesToIndex = pagesUrls.filter((page) => {
        const dbPage = pagesGet.data?.find((p) => p.url === page);
        if (!dbPage || job.data.force) {
            return true;
        }
        return dbPage.cmp_info == null;
    });

    console.log("indexing pages", pagesToIndex.join("\n"));
    // return

    const scrapeProms = pagesToIndex.map(async (page) => {
        const indexResults = await indexPage(page);

        if (!indexResults) {
            console.warn("Failed to index", page);
        }

        const upsert = await supabase
            .from("comp_pages")
            .upsert({ ...indexResults, company_id: company.id!, url: page })
            .select()
            .single();

        if (upsert.error) {
            throw upsert.error;
        }

        return upsert.data;
    });
    const indexedPages = await Promise.all(scrapeProms);

    const industryQueue = new IndustryQueueClient();
    await industryQueue.scrapeLogo(company.id);
    await industryQueue.reduceCompanyPages(company.id);
    await industryQueue.close();

    return company.id;
}




