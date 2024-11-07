"use client";

import {
  Anchor,
  Box,
  Skeleton,
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
  loading?: boolean;
};
export function CompaniesTable({ companies, loading }: CompanyTableProps) {
  const searchParams = useSearchParams();

  const loadingRows = Array.from({ length: 15 }).map((_, i) => (
    <TableTr key={i}>
      <TableTd width="25%">
        <Skeleton height={26} />
      </TableTd>
      <TableTd>
        <Skeleton height={26} />
      </TableTd>
    </TableTr>
  ));

  const rows = companies.map((company) => (
    <TableTr key={company.id}>
      <TableTd>
        <Anchor
          component={Link}
          // i may have broken this??
          href={`/portal/companies/${company.id}/overview#page=${searchParams.get("page") || 1}&search=${encodeURIComponent(searchParams.get("query") ?? "")}`}
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

        <TableTbody>{loading ? loadingRows : rows}</TableTbody>
      </Table>
      {!loading && companies?.length === 0 && <EmptyCompanyListState />}
    </Box>
  );
}
