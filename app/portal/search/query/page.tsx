import { serverClient } from "@/shared/supabase-client/server";
import React, { Suspense } from "react";
import { CompaniesTable } from "../../companies/CompanyTable";
import { Box, Stack, Text } from "@mantine/core";
import { getEmbedding } from "@/shared/llmHelpers";
import AiSearch from "../AiSearch";

export default async function Page({ searchParams }: { searchParams: { q: string } }) {
  const supabase = serverClient();
  const query = searchParams.q;

  const embProm = getEmbedding(query);
  const insertSearchProm = supabase.from("searches").upsert({ query }).select().single();

  const [emb, insertSearch] = await Promise.all([embProm, insertSearchProm]);

  if (insertSearch.error) {
    throw insertSearch.error;
  }

  const companiesGet = await supabase.rpc("match_cmp_adaptive", {
    query_embedding: JSON.stringify(emb),
    match_count: 100,
  });

  return (
    <Stack>
      <AiSearch />
      <CompaniesTable companies={companiesGet.data ?? []} />
    </Stack>
  );
}
