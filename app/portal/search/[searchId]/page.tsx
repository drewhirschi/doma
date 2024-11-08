import { serverClient } from "@/shared/supabase-client/server";
import React, { Suspense } from "react";
import { CompaniesTable } from "../../companies/CompanyTable";
import { Box, Stack, Text } from "@mantine/core";

export default async function Page({ params }: { params: { searchId: string } }) {
  const supabase = serverClient();
  // const [emb, setEmb] = useState<number[] | null>(null);
  // const [companies, setCompanies] = useState<CompanyProfile_SB[]>([]);

  const searchGet = await supabase.from("searches").select("query, emb").eq("id", params.searchId).single();

  if (searchGet.error) {
    throw searchGet.error;
  }
  // const emb = JSON.parse(searchGet.data.emb);

  const companiesGet = await supabase.rpc("match_cmp_adaptive", {
    query_embedding: searchGet.data.emb,
    match_count: 100,
  });

  return (
    <Stack>
      <CompaniesTable companies={companiesGet.data ?? []} />
    </Stack>
  );
}
