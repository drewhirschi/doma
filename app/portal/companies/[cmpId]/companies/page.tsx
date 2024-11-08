import { Box } from "@mantine/core";
import CompanyList from "./CompanyList";
import { PAGE_SIZE } from "../shared";
import { serverClient } from "@/shared/supabase-client/server";

interface CompanyWithSimilarity extends CompanyProfile_SB {
  similarity: number;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { cmpId: string };
  searchParams: {
    query?: string;
    page?: string;
    distance?: string;
    distanceFilter?: boolean;
    employeeCount?: string;
  };
}) {
  const distance = parseInt(searchParams.distance ?? "0");
  const searchTerm = searchParams.query || "";
  let employeeCountRanges: string[] | undefined = decodeURIComponent(searchParams.employeeCount ?? "").split(",");
  if (employeeCountRanges.length === 1 && employeeCountRanges[0] === "") {
    employeeCountRanges = undefined;
  }
  const searchIsNumber = !isNaN(Number(searchTerm)) && searchTerm;

  const supabase = serverClient();

  const companyGet = await supabase
    .from("company_profile")
    .select("*, li_profile(headcount_range)")
    .eq("id", params.cmpId)
    .single();

  if (companyGet.error) {
    throw new Error(companyGet.error.message);
  }

  const modelCmp = companyGet.data;
  if (!modelCmp.web_summary_emb) return;

  let similarCompaniesGet;

  similarCompaniesGet = await supabase.rpc("match_and_nearby_cmp", {
    query_embedding: modelCmp.web_summary_emb!,
    lat: modelCmp.hq_lat ?? 0,
    long: modelCmp.hq_lon ?? 0,
    distance: Number(distance) * 1609.34,
    match_count: 100,
    apply_distance_filter: distance > 0,
    headcount_range_filter: employeeCountRanges,
  });

  if (similarCompaniesGet.error || !similarCompaniesGet.data) {
    throw new Error(similarCompaniesGet.error?.message || "No data found for match_and_nearby_cmp");
  }

  const filteredCompanies = similarCompaniesGet.data.filter((company) => {
    return (
      company.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      company.origin?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (searchIsNumber && company.id === Number(searchTerm))
    );
  });

  const count = filteredCompanies.length;

  return (
    <Box maw={"100vw"}>
      <CompanyList sortedCompanies={filteredCompanies} count={count} />
    </Box>
  );
}
