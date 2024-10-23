import {
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Accordion,
  AccordionItem,
  AccordionControl,
  AccordionPanel,
  Text,
} from "@mantine/core";

import { serverClient } from "@/shared/supabase-client/server";
import { PAGE_SIZE } from "../shared";

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

  const transactionsGet = await supabase
    .rpc("get_company_transactions_and_articles", { companyid: cmpId })
    .order("transaction_id", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (transactionsGet.error) {
    throw new Error(transactionsGet.error.message);
  }

  const groupedTransactions = transactionsGet.data.reduce(
    (acc: { [key: number]: any }, element) => {
      if (!element) return acc;

      const {
        transaction_id,
        transaction_date,
        reason,
        description,
        amount,
        article_id,
        article_title,
        article_url,
      } = element;

      if (!acc[transaction_id]) {
        acc[transaction_id] = {
          transaction_date,
          reason,
          description,
          amount,
          articles: [],
        };
      }

      if (article_id) {
        acc[transaction_id].articles.push({ article_title, article_url });
      }

      return acc;
    },
    {},
  );

  const rows = Object.entries(groupedTransactions).map(
    ([transaction_id, transaction]) => {
      const displayAmount =
        transaction.amount === null || transaction.amount === 0
          ? undefined
          : transaction.amount;

      return (
        <TableTr key={transaction_id}>
          <TableTd>{transaction.transaction_date}</TableTd>
          <TableTd>{transaction.reason}</TableTd>
          <TableTd>{transaction.description}</TableTd>
          <TableTd>{displayAmount ?? "Undisclosed"}</TableTd>
          <TableTd>
            <Accordion>
              <AccordionItem value={transaction_id}>
                <AccordionControl>Articles</AccordionControl>
                <AccordionPanel>
                  <ul>
                    {transaction.articles.map(
                      (
                        article: {
                          article_title: string;
                          article_url: string;
                        },
                        index: number,
                      ) => (
                        <li key={index}>
                          <strong>Title:</strong> {article.article_title}
                          <br />
                          <strong>URL:</strong>{" "}
                          <a
                            href={article.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {article.article_url}
                          </a>
                        </li>
                      ),
                    )}
                  </ul>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </TableTd>
        </TableTr>
      );
    },
  );

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
