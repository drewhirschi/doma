import { Anchor, Box, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";

import { EmptyCompanyListState } from "@/ux/components/CompanyList.EmptyState";
import Link from "next/link";
import { SearchAndPage } from "./SearchAndPage";
import { serverClient } from "@/shared/supabase-client/server";
import { PAGE_SIZE } from "./[cmpId]/shared";

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
    .not("web_summary", "eq", null)
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Error fetching companies:", error);
    return <div>Error loading companies</div>;
  }

  const rows = companies.map((company) => (
    <TableTr key={company.id}>
      <TableTd>
        <Anchor
          component={Link}
          href={`/portal/companies/${company.id}/overview#page=${page}&search=${encodeURIComponent(searchTerm)}`}
        >
          {company.name ?? company.origin}
        </Anchor>
      </TableTd>
      <TableTd
        maw={"600px"}
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        c={"dimmed"}
        fz={"sm"}
      >
        {company.description}
      </TableTd>
    </TableTr>
  ));

  return (
    <Box maw={"100vw"}>
      <Paper shadow="xs" p="md" mb="md">
        <SearchAndPage totalCount={count ?? 0} />
      </Paper>

      <Table highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh style={{ width: "25%" }}>Company Name</TableTh>
            <TableTh style={{ width: "75%" }}>Description</TableTh>
          </TableTr>
        </TableThead>

        <TableTbody>{rows}</TableTbody>
      </Table>
      {companies?.length === 0 && <EmptyCompanyListState />}
    </Box>
  );
}
