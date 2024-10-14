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

export default async function Page({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { query: string; page: number };
}) {
  // const query = searchParams?.query || "";
  // const page = Number(searchParams?.page) - 1 || 0;

  // const supabase = serverClient();

  // const projectGet = await supabase
  //   .from("ib_projects")
  //   .select("*, company_profile(*)")
  //   .eq("id", params.projectId)
  //   .single();

  // const transactionsGet = await supabase
  //   .from("transaction_search_res")
  //   .select("*, company_profile(*)")
  //   .order("id", { ascending: false });
  // // .limit(30)
  // // .eq('project_id', params.projectId)
  // // .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  // if (transactionsGet.error) {
  //   throw new Error(transactionsGet.error.message);
  // }

  // const transactions = transactionsGet.data;
  // // console.log(transactions)

  // const similarityGet = await supabase.rpc("match_transactions_seller", {
  //   match_count: 30,
  //   match_threshold: 0.05,
  //   query_embedding: projectGet.data?.company_profile?.web_summary_emb!,
  // });

  // const rows =
  //   similarityGet.data
  //     ?.map((sim) => {
  //       const element = transactions?.find((x) => x.id === sim.transaction_id);

  //       if (!element) {
  //         return undefined;
  //       }

  //       return (
  //         <TableTr key={element.id}>
  //           <TableTd>
  //             <Link href={element.url} target="_blank">
  //               {element.id}
  //             </Link>
  //           </TableTd>
  //           {/* <TableTd><Link href={element.url} target='_blank'>{element.url}</Link></TableTd> */}
  //           <TableTd>{element.seller_name}</TableTd>
  //           <TableTd>{element.buyer_name}</TableTd>
  //           <TableTd>{element.date}</TableTd>
  //           <TableTd>{element.reason}</TableTd>
  //           <TableTd>
  //             {element.company_profile?.map((x) => x.name).join(", ") ?? ""}
  //           </TableTd>
  //         </TableTr>
  //       );
  //     })
  //     .filter(isDefined) ?? [];

  return (
    <Table>
      <TableThead>
        <TableTr>
          <TableTh>ID</TableTh>
          <TableTh>Seller</TableTh>
          <TableTh>Buyer</TableTh>
          <TableTh>Date</TableTh>
          <TableTh>Reason</TableTh>
          <TableTh>Participants</TableTh>
        </TableTr>
      </TableThead>
      {/* <TableTbody>{rows}</TableTbody> */}
    </Table>
  );
}
