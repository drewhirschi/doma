"use server";

import { revalidatePath } from "next/cache";
import { serverActionClient } from "@/shared/supabase-client/server";

export async function renameProject(projectId: number, newName: string) {
  const supabase = serverActionClient();

  const { error } = await supabase
    .from("ib_projects")
    .update({ title: newName })
    .eq("id", projectId)
    .throwOnError();

  revalidatePath(`/portal/projects/${projectId}`);

  return;
}

export async function deleteProject(projectId: number) {
  const sb = serverActionClient();

  const { error } = await sb
    .from("ib_projects")
    .delete()
    .eq("id", projectId)
    .throwOnError();

  revalidatePath("/portal/projects");

  return;
}
