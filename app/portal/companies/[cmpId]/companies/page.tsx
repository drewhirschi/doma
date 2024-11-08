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
  const page = parseInt(searchParams.page ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;
  const searchIsNumber = !isNaN(Number(searchTerm)) && searchTerm;
  //const orClause = `name.ilike.%${searchTerm}%,origin.ilike.%${searchTerm}%${searchIsNumber ? ",id.eq." + searchTerm : ""}`;

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

  // TODO: Change this if we want to preserve search on the backend - this was just easier to get the paging working
  // Fine for now with only the first 100 companies, but will need to change if we want to search more similar companies
  const filteredCompanies = similarCompaniesGet.data.filter((company) => {
    return (
      company.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      company.origin?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (searchIsNumber && company.id === Number(searchTerm))
    );
  });

  const count = filteredCompanies.length;

  const paginatedCompanies = filteredCompanies.slice(offset, offset + PAGE_SIZE);

  const paginatedIds = paginatedCompanies.map((company) => company.id);
  const companiesGet = await supabase.from("company_profile").select("*").in("id", paginatedIds);

  if (companiesGet.error) {
    throw new Error(companiesGet.error.message);
  }

  const sortedCompanies = paginatedCompanies
    .map((company) => {
      const companyProfile = companiesGet.data.find((cmp) => cmp.id === company.id) ?? null;
      return companyProfile ? { ...companyProfile, similarity: company.similarity } : null;
    })
    .filter((company): company is CompanyWithSimilarity => company !== null);

  return (
    <Box maw={"100vw"}>
      <CompanyList sortedCompanies={filteredCompanies} count={count} />
    </Box>
  );
}
