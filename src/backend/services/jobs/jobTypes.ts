import { z } from 'zod';

// Define schemas for each job type
export const companyDiscoverSchema = z.object({
    cmpId: z.number(),

});

export const scrapeWebsiteSchema = z.object({
    url: z.string(),
});

export const reducePagesSchema = z.object({
    cmpId: z.number(),
});
export const transactionDiscoverySchema = z.object({
    cmpId: z.number(),

});
export const transactionLinkingSchema = z.object({
    trans_news_id: z.number(),
});

// Create a schema map
export const jobSchemas = {
    company_discovery: companyDiscoverSchema,
    scrape_company_website: scrapeWebsiteSchema,
    reduce_company_pages: reducePagesSchema,
    transaction_discovery: transactionDiscoverySchema,
    transaction_linking: transactionLinkingSchema,
};

export type JobType = keyof typeof jobSchemas;

export type JobDataType = z.infer<typeof companyDiscoverSchema> |
    z.infer<typeof scrapeWebsiteSchema> |
    z.infer<typeof reducePagesSchema> |
    z.infer<typeof transactionDiscoverySchema> |
    z.infer<typeof transactionLinkingSchema>;