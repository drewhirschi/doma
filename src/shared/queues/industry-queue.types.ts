import { z } from "zod";

// Define schemas for each job type
export const companyIdSchema = z.object({
  cmpId: z.number(),
});

export const scrapeWebsiteSchema = z.object({
  url: z.string(),
  force: z.boolean().optional(),
  scrapeComps: z.boolean().optional(),
});

export const transactionLinkingSchema = z.object({
  trans_news_id: z.number(),
});

// Create a schema map
export const jobSchemas = {
  get_li_profile: companyIdSchema,
  company_discovery: companyIdSchema,
  scrape_company_website: scrapeWebsiteSchema,
  reduce_company_pages: companyIdSchema,
  transaction_discovery: companyIdSchema,
  transaction_linking: transactionLinkingSchema,
  scrape_logo: companyIdSchema,
  scrape_ma_articles: companyIdSchema,
};

export type JobType = keyof typeof jobSchemas;

export type JobDataType =
  | z.infer<typeof companyIdSchema>
  | z.infer<typeof scrapeWebsiteSchema>
  | z.infer<typeof transactionLinkingSchema>;
