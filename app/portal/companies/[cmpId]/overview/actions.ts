"use server";

import { RapidApiLinkdeInScraper, parseCompanySlug } from "@/shared/LinkedIn";

import { IndustryQueueClient } from "@/shared/queues/industry-queue";
import { redirect } from "next/navigation";
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

export async function createCompany(url: string) {
  const sb = serverActionClient();

  const addProtocolIfNeeded = (url: string) => {
    const hasProtocol = /^https?:\/\//i.test(url);
    return hasProtocol ? url : `https://${url}`;
  };

  const cmpGet = await sb
    .from("company_profile")
    .select()
    .ilike("origin", `%${new URL(url).hostname}%`)
    .maybeSingle();

  if (cmpGet.error) {
    throw cmpGet.error;
  }

  let company = cmpGet.data;
  if (!company) {
    url = addProtocolIfNeeded(url);
    const cmpInsert = await sb
      .from("company_profile")
      .insert({ origin: new URL(url).origin })
      .select()
      .single();
    if (cmpInsert.error) {
      throw cmpInsert.error;
    }

    company = cmpInsert.data;
  }

  const queue = new IndustryQueueClient();
  await queue.scrapeCompanyWebsite(company.id, { force: false });
  queue.close();

  redirect(`/portal/companies/${company.id}/overview`);
}

export async function queueArticleScraping(cmpId: number) {
  const queue = new IndustryQueueClient();
  await queue.scrapeArticles(cmpId);
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

export async function updateCompanyLinkedinProfile(company: CompanyProfile_SB, newLiUrl: string) {
  const linkedinApi = new RapidApiLinkdeInScraper();
  const companySlug = parseCompanySlug(newLiUrl);

  if (!companySlug) {
    throw new Error("Bad LinkedIn company Url.");
  }
  const linkedinProfile = await linkedinApi.getCompanyBySlug(companySlug);
  if (!linkedinProfile) {
    throw new Error("Failed to get linkedin profile");
  }

  const sbFormatProfile = linkedinApi.sbFormat(linkedinProfile);

  const sb = serverActionClient();

  const insertProfile = await sb.from("li_profile").insert(sbFormatProfile).select();
  if (insertProfile.error) {
    throw new Error("Failed to insert linkedin profile", {
      cause: insertProfile.error,
    });
  }

  const updateProfile = await sb
    .from("company_profile")
    .update({ liprofile_slug: insertProfile.data[0].slug })
    .eq("id", company.id);
  if (updateProfile.error) {
    throw new Error("Failed to attach linkedin profile to company", {
      cause: updateProfile.error,
    });
  }

  revalidatePath(`/portal/companies/${company.id}/overview`);
}
