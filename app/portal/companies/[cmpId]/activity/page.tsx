import { serverClient } from "@/shared/supabase-client/server";
import TransactionsTable from "../../../../../src/ux/components/TransactionsTable";
import AddTransactions from "../../../../../src/ux/components/AddTransactions";

export default async function Page({ params }: { params: { cmpId: string } }) {
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

  const transactions = cmpWithTransactionsGet.data.ma_transaction.map(
    (transaction: any) => ({
      ...transaction,
      id: transaction.id.toString(),
    }),
  );

  if (!transactions || transactions.length === 0) {
    return <AddTransactions cmpId={cmpId} />;
  }

  return <TransactionsTable transactions={transactions} />;
}
