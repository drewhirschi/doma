import {
  Anchor,
  Box,
  Group,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconChevronLeft,
  IconFileArrowLeft,
  IconHome,
  IconMessageCircle,
  IconPhoto,
  IconSettings,
} from "@tabler/icons-react";
import { RedirectType, redirect } from "next/navigation";

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

  const projectsGet = await supabase.from("ib_projects").select("*");
  // .eq('project_id', params.projectId)
  // .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  if (projectsGet.error) {
    throw new Error(projectsGet.error.message);
  }

  const transactions = projectsGet.data;
  // console.log(transactions)

  const rows = transactions.map((element) => (
    <TableTr key={element.id}>
      <TableTd>
        <Anchor
          component={Link}
          href={`/portal/projects/${element.id}/overview`}
        >
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
            <TableTh>Name</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </Box>
  );
}
