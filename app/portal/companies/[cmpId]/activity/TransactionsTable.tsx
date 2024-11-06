"use client";

import { useState } from "react";
import {
  Modal,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Anchor,
  Stack,
  Box,
} from "@mantine/core";
import { isNotNull } from "@/shared/types/typeHelpers";
import AddTransactions from "./AddTransactions";

interface Transaction {
  id: string;
  date?: string;
  description: string;
  reason?: string;
  amount?: string;
  ma_articles: { title: string; url: string; publish_date: string }[];
  participants: { role: string; company_profile: { name: string; id: number } }[];
}

interface TransactionsTableProps {
  transactions: Transaction[];
  cmpId: number;
}

export default function TransactionsTable({ transactions, cmpId }: TransactionsTableProps) {
  const [openedTransaction, setOpenedTransaction] = useState<Transaction | null>(null);

  const openModal = (transaction: Transaction) => setOpenedTransaction(transaction);
  const closeModal = () => setOpenedTransaction(null);

  const rows = transactions.map((transaction) => (
    <TableTr key={transaction.id} onClick={() => openModal(transaction)} style={{ cursor: "pointer" }}>
      <TableTd>
        {transaction.date ??
          transaction.ma_articles
            .map((a) => a.publish_date)
            .filter(isNotNull)
            .at(0)}
      </TableTd>
      <TableTd>{transaction.description}</TableTd>
    </TableTr>
  ));

  return (
    <>
      <Table highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh style={{ width: "12%" }}>Date</TableTh>
            <TableTh style={{ width: "88%" }}>Description</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
      <AddTransactions cmpId={cmpId} />

      {openedTransaction && <TransactionModal cmpId={cmpId} transaction={openedTransaction} closeModal={closeModal} />}
    </>
  );
}

interface TransactionModalProps {
  transaction: Transaction;
  closeModal: () => void;
  cmpId: number;
}

function TransactionModal({ transaction, closeModal, cmpId }: TransactionModalProps) {
  return (
    <Modal opened={!!transaction} onClose={closeModal} title={<Text fw={700}>Transaction Details</Text>} size={"lg"}>
      <Stack>
        <Box>
          <Text fw={700}>Date</Text>
          {transaction.date}
        </Box>
        <Box>
          <Text fw={700}>Description</Text>
          {transaction.description}
        </Box>
        <Box>
          <Text fw={700}>Reason</Text>
          {transaction.reason || "Undisclosed"}
        </Box>
        <Box>
          <Text fw={700}>Amount</Text>
          {transaction.amount || "Undisclosed"}
        </Box>
        <Box>
          <Text fw={700}>Participants</Text>
          <Stack gap={4}>
            {transaction.participants
              .filter((p) => p.company_profile.id != cmpId)
              .map((p) => (
                <Anchor href={`/portal/companies/${p.company_profile.id}`}>{p.company_profile.name}</Anchor>
              ))}
          </Stack>
        </Box>

        {transaction.ma_articles.length > 0 && (
          <>
            <Text fw={700}>Articles</Text>
            <Stack gap={4}>
              {transaction.ma_articles.map((article, index) => (
                <li key={index}>
                  <Anchor href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </Anchor>
                </li>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Modal>
  );
}
