"use server";

import { getEmbedding } from "@/shared/llmHelpers";
import { serverActionClient } from "@/shared/supabase-client/server";
import { redirect } from "next/navigation";

export async function createSearch(query: string, searchId?: string) {
  const supabase = serverActionClient();

  const emb = await getEmbedding(query);
  const insertSearch = await supabase
    .from("searches")
    .upsert({ id: Number(searchId), query, emb: JSON.stringify(emb) })
    .select()
    .single();

  if (insertSearch.error) {
    throw insertSearch.error;
  }

  return redirect("/portal/search/" + insertSearch.data?.id);
}
