import { Group, Stack, Title } from "@mantine/core";

import { BackButton } from "@/ux/components/BackButton";
import { ProjectTabs } from "./ProjectTabs";
import { serverClient } from "@/shared/supabase-client/server";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const project = await serverClient()
    .from("ib_projects")
    .select("*")
    .eq("id", params.projectId)
    .single();

  return (
    <Stack h={"100vh"} gap={0} w="calc(100vw - 60px)">
      <Group p="sm" mb={"sm"} miw={860}>
        {/* <div> */}

        <BackButton href={"/portal/projects"} />
        <Title order={1}>{project.data?.title}</Title>
        {/* </div> */}
      </Group>
      <ProjectTabs>{children}</ProjectTabs>
    </Stack>
  );
}
