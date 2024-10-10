"use server";

import { RapidApiLinkdeInScraper, parseCompanySlug } from "@/shared/LinkedIn";

import { IndustryQueueClient } from "@/shared/queues/industry-queue";
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
  await queue.scrapeCompanyWebsite(url, { force: true });
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

  revalidatePath(`/portal/companies/${logo.cmp_id}/overview`);
}

export async function updateCompanyLinkedinProfile(
  company: CompanyProfile_SB,
  newLiUrl: string,
  oldLiProfile?: LinkedInProfile_SB,
) {


  const linkedinApi = new RapidApiLinkdeInScraper()
  const companySlug = parseCompanySlug(newLiUrl);

  if (!companySlug) {
    throw new Error("Bad LinkedIn company Url.");
  }
  const linkedinProfile = await linkedinApi.getCompany(companySlug);
  if (!linkedinProfile) {
    throw new Error("Failed to get linkedin profile");
  }

  const sbFormatProfile = linkedinApi.sbFormat(linkedinProfile, company.id);

  const sb = serverActionClient();

  const insertProfile = await sb.from("cmp_li_profile").insert(sbFormatProfile);
  if (insertProfile.error) {
    throw new Error("Failed to insert linkedin profile", {
      cause: insertProfile.error,
    });
  }


  if (oldLiProfile) {
    const deleteOld = await sb.from("cmp_li_profile").delete().eq("url", oldLiProfile.url);
    if (deleteOld.error) {
      throw new Error("Failed to unlink current profile", {
        cause: deleteOld.error,
      });
    }
  }


  revalidatePath(`/portal/companies/${company.id}/overview`);



}
