"use client";

import {
  Anchor,
  Box,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

import { EmptyCompanyListState } from "@/ux/components/CompanyList.EmptyState";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type CompanyTableProps = {
  companies: {
    id: number;
    name: string | null;
    origin: string | null;
    description: string | null;
  }[];
};
export function CompaniesTable({ companies }: CompanyTableProps) {
  const searchParams = useSearchParams();

  const rows = companies.map((company) => (
    <TableTr key={company.id}>
      <TableTd>
        <Anchor
          component={Link}
          href={`/portal/companies/${company.id}/overview#page=${searchParams.get("page")}&search=${encodeURIComponent(searchParams.get("query") ?? "")}`}
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
    <Box>
      <Table highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh>Company Name</TableTh>
            <TableTh>Description</TableTh>
          </TableTr>
        </TableThead>

        <TableTbody>{rows}</TableTbody>
      </Table>
      {companies?.length === 0 && <EmptyCompanyListState />}
    </Box>
  );
}
