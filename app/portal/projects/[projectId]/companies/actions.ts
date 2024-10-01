"use server";

import { revalidatePath } from "next/cache";
import { serverActionClient } from "@/shared/supabase-client/server";

export async function addCompaniesToProject(
  projectId: number,
  companyIds: number[],
) {
  const sb = serverActionClient();

  const { error } = await sb
    .from("deal_comps")
    .insert(companyIds.map((id) => ({ project_id: projectId, cmp_id: id })))
    .throwOnError();

  revalidatePath(`/portal/projects/${projectId}/companies`);
}
