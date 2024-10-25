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
} from "@mantine/core";

interface Transaction {
  id: string;
  date: string;
  description: string;
  reason?: string;
  amount?: string;
  ma_articles: { title: string; url: string }[];
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export default function TransactionsTable({
  transactions,
}: TransactionsTableProps) {
  const [openedTransaction, setOpenedTransaction] =
    useState<Transaction | null>(null);

  const openModal = (transaction: Transaction) =>
    setOpenedTransaction(transaction);
  const closeModal = () => setOpenedTransaction(null);

  const rows = transactions.map((transaction) => (
    <TableTr
      key={transaction.id}
      onClick={() => openModal(transaction)}
      style={{ cursor: "pointer" }}
    >
      <TableTd>{transaction.date}</TableTd>
      <TableTd>{transaction.description}</TableTd>
    </TableTr>
  ));

  return (
    <>
      <Table highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh>Date</TableTh>
            <TableTh>Description</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>

      {openedTransaction && (
        <TransactionModal
          transaction={openedTransaction}
          closeModal={closeModal}
        />
      )}
    </>
  );
}

interface TransactionModalProps {
  transaction: Transaction;
  closeModal: () => void;
}

function TransactionModal({ transaction, closeModal }: TransactionModalProps) {
  return (
    <Modal
      opened={!!transaction}
      onClose={closeModal}
      title={<Text fw={700}>Transaction Details</Text>}
    >
      <Text>
        <Text component="span" style={{ textDecoration: "underline" }}>
          Date:
        </Text>{" "}
        {transaction.date}
      </Text>
      <Text mt="sm">
        <Text component="span" style={{ textDecoration: "underline" }}>
          Description:
        </Text>{" "}
        {transaction.description}
      </Text>
      <Text mt="sm">
        <Text component="span" style={{ textDecoration: "underline" }}>
          Reason:
        </Text>{" "}
        {transaction.reason || "Undisclosed"}
      </Text>
      <Text mt="sm">
        <Text component="span" style={{ textDecoration: "underline" }}>
          Amount:
        </Text>{" "}
        {transaction.amount || "Undisclosed"}
      </Text>

      {transaction.ma_articles.length > 0 && (
        <>
          <Text mt="md" style={{ textDecoration: "underline" }}>
            Articles:
          </Text>{" "}
          <ul>
            {transaction.ma_articles.map((article, index) => (
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
        </>
      )}
    </Modal>
  );
}
