"use server";

import { IndustryQueueClient } from "@/backend/services/jobs/industry-queue";
import { revalidatePath } from "next/cache";
import { serverActionClient } from "@/shared/supabase-client/server";

export async function queueFindIndustryCompanies(cmpId: number) {
  const queue = new IndustryQueueClient();
  await queue.companyDiscovery(cmpId);
  queue.close();
}

export async function queueFindIndustyActivity(cmpId: number) {
  const queue = new IndustryQueueClient();
  await queue.transactionDiscovery(cmpId);
  queue.close();
}

export async function queueCompanyProfiling(url: string) {
  const queue = new IndustryQueueClient();
  await queue.scrapeCompanyWebsite(url);
  queue.close();
}

export async function deleteLogo(logo: CompanyLogo_SB) {
  const sb = serverActionClient();
  const deleteRow = await sb.from("cmp_logos").delete().eq("url", logo.url);
  if (deleteRow.error) {
    throw new Error("Failed to delete logo row", { cause: deleteRow.error });
  }
  const deleteFile = await sb.storage.from("cmp_assets").remove([logo.path]);
  if (deleteFile.error) {
    throw new Error("Failed to delete logo file", deleteFile.error);
  }

  revalidatePath(`/portal/research/companies/${logo.cmp_id}/overview`);
}
