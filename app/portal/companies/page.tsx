import { Box, Paper, Stack } from "@mantine/core";

import { CompaniesTable } from "./CompanyTable";
import { PAGE_SIZE } from "./[cmpId]/shared";
import { SearchAndPage } from "./SearchAndPage";
import { serverClient } from "@/shared/supabase-client/server";

export default async function CompaniesPage({ searchParams }: { searchParams: { query?: string; page?: string } }) {
  const searchTerm = searchParams.query || "";
  const page = parseInt(searchParams.page ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = serverClient();

  const searchIsNumber = !isNaN(Number(searchTerm)) && searchTerm;
  const orClause = `name.ilike.%${searchTerm}%,origin.ilike.%${searchTerm}%${searchIsNumber ? ",id.eq." + searchTerm : ""}`;
  const {
    data: companies,
    error,
    count,
  } = await supabase
    .from("company_profile")
    .select("*", { count: "estimated" })
    .or(orClause)
    .not("origin", "is", null)
    .not("web_summary", "eq", null)
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Error fetching companies:", error);
    return <div>Error loading companies</div>;
  }

  return (
    <Box maw={"100vw"}>
      <Paper shadow="xs" p="md" mb="md">
        <Stack>
          <SearchAndPage totalCount={count ?? 0} />
        </Stack>
      </Paper>

      <CompaniesTable companies={companies ?? []} />
    </Box>
  );
}
