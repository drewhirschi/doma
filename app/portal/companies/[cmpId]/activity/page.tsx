import { RedirectType, redirect } from "next/navigation";
import {
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

import Link from "next/link";
import { isDefined } from "@/shared/types/typeHelpers";
import { serverClient } from "@/shared/supabase-client/server";
import { PAGE_SIZE } from "../shared";

export default async function Page({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { query: string; page: number };
}) {
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) - 1 || 0;

  const supabase = serverClient();

  const transactionsGet = await supabase
    .from("ma_transaction")
    .select("*")
    .order("id", { ascending: false })
    .limit(30)
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (transactionsGet.error) {
    throw new Error(transactionsGet.error.message);
  }

  const rows =
    transactionsGet.data
      ?.map((element) => {
        if (!element) {
          return undefined;
        }

        return (
          <TableTr key={element.id}>
            <TableTd>{element.date}</TableTd>
            <TableTd>{element.reason}</TableTd>
            <TableTd>{element.amount}</TableTd>
            <TableTd>{element.description}</TableTd>
            <TableTd>{element.emb}</TableTd>
          </TableTr>
        );
      })
      .filter(isDefined) ?? [];

  return (
    <Table>
      <TableThead>
        <TableTr>
          <TableTh>Date</TableTh>
          <TableTh>Reason</TableTh>
          <TableTh>Amount</TableTh>
          <TableTh>Description</TableTh>
          <TableTh>Embedding</TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>{rows}</TableTbody>
    </Table>
  );
}
