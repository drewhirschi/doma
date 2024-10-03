import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  TextInput,
} from "@mantine/core";

import { EmptyCompanyListState } from "@/ux/components/CompanyList.EmptyState";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { RedirectType } from "next/navigation";
import { SearchAndPage } from "./SearchAndPage";
import { redirect } from "next/navigation";
import { serverClient } from "@/shared/supabase-client/server";
import { PAGE_SIZE } from "./[cmpId]/shared";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { query?: string; page?: string };
}) {
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
          href={`/portal/companies/${company.id}/overview`}
        >
          {company.name ?? company.origin}
        </Anchor>
      </TableTd>
      <TableTd>{company.origin}</TableTd>
    </TableTr>
  ));

  async function handleSearch(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;
    redirect(
      `/portal/companies?search=${encodeURIComponent(search)}`,
      RedirectType.replace,
    );
  }

  return (
    <Container size="xl">
      <Paper shadow="xs" p="md" mb="md">
        <SearchAndPage totalCount={count ?? 0} />
      </Paper>

      <Table striped highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh>Company Name</TableTh>
            <TableTh>URL</TableTh>
          </TableTr>
        </TableThead>

        <TableTbody>{rows}</TableTbody>
      </Table>
      {companies?.length === 0 && <EmptyCompanyListState />}
    </Container>
  );
}
