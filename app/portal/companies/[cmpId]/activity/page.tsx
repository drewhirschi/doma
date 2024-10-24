import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Anchor,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";

import { PAGE_SIZE } from "../shared";
import { serverClient } from "@/shared/supabase-client/server";

export default async function Page({
  params,
  searchParams,
}: {
  params: { cmpId: string };
  searchParams: { query: string; page: number };
}) {
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) - 1 || 0;
  const cmpId = Number(params.cmpId);

  const supabase = serverClient();

  const cmpWithTransactionsGet = await supabase
    .from("company_profile")
    .select("*, ma_transaction(*, ma_articles(url, title))")
    .eq("id", cmpId)
    .single();

  if (cmpWithTransactionsGet.error) {
    throw new Error(cmpWithTransactionsGet?.error.message);
  }

  const transactions = cmpWithTransactionsGet.data.ma_transaction;

  const rows = transactions.map((transaction) => {
    console.log(transaction.id, transaction.ma_articles);
    return (
      <TableTr key={transaction.id}>
        <TableTd>{transaction.date}</TableTd>
        <TableTd>{transaction.reason}</TableTd>
        <TableTd>{transaction.description}</TableTd>
        <TableTd>{transaction.amount || "Undisclosed"}</TableTd>
        <TableTd>
          <Accordion>
            <AccordionItem value={String(transaction.id)}>
              <AccordionControl>Articles</AccordionControl>
              <AccordionPanel>
                <ul>
                  {transaction.ma_articles.map((article, index: number) => (
                    <li key={index}>
                      <Anchor
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.title}
                      </Anchor>
                    </li>
                  ))}
                </ul>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </TableTd>
      </TableTr>
    );
  });

  return (
    <Table>
      <TableThead>
        <TableTr>
          <TableTh>Date</TableTh>
          <TableTh>Reason</TableTh>
          <TableTh>Description</TableTh>
          <TableTh>Amount</TableTh>
          <TableTh>Articles</TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>{rows}</TableTbody>
    </Table>
  );
}
