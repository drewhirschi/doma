import AiSearch from "./AiSearch";
import { Anchor, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";

import { serverClient } from "@/shared/supabase-client/server";
import Link from "next/link";

interface IpageProps {}

export default async function page() {
  const supabase = serverClient();

  const searchesGet = await supabase.from("searches").select("id,query").order("created_at", { ascending: false });
  if (searchesGet.error) {
    throw searchesGet.error;
  }

  const elements = searchesGet.data;
  const rows = elements.map((element) => (
    <TableTr key={element.id}>
      <TableTd>
        <Anchor component={Link} href={`/portal/search/${element.id}`} c={"inherit"}>
          {element.query}
        </Anchor>
      </TableTd>
    </TableTr>
  ));

  return (
    <Table>
      <TableThead>
        <TableTr>
          <TableTh>History</TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>{rows}</TableTbody>
    </Table>
  );
}
