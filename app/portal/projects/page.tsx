import { Anchor, Box, Group, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";
import { AddProjectModal } from "./AddProject";
import Link from "next/link";
import { serverClient } from "@/shared/supabase-client/server";

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

  const projectsGet = await supabase.from("ib_projects").select("*").order("created_at", { ascending: false });

  if (projectsGet.error) {
    throw new Error(projectsGet.error.message);
  }

  const transactions = projectsGet.data;

  const rows = transactions.map((element) => (
    <TableTr key={element.id}>
      <TableTd>
        <Anchor component={Link} href={`/portal/projects/${element.id}/overview`}>
          {element.title}
        </Anchor>
      </TableTd>
    </TableTr>
  ));

  return (
    <Box>
      <Group justify="flex-end">
        <AddProjectModal />
      </Group>
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>Project Name</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </Box>
  );
}
