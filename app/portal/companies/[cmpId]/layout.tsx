import { Anchor, Group, Stack, Title } from "@mantine/core";

import { ProjectTabs } from "./ProjectTabs";
import { serverClient } from "@/shared/supabase-client/server";
import { BreadcrumbsComponent } from "./Breadcrumbs";
import { CompanyTitleEditor } from "./CompanyTitleEditor";

export default async function Layout({ children, params }: { children: React.ReactNode; params: { cmpId: string } }) {
  const companyGet = await serverClient().from("company_profile").select("*").eq("id", params.cmpId).single();

  if (companyGet.error) {
    console.log(companyGet.error);
    return <Title>Not found</Title>;
  }

  const { origin } = companyGet.data;
  return (
    <Stack h={"100vh"} gap={0} w="calc(100vw - 60px)">
      <Stack p="sm" mb={"sm"} gap={0}>
        <BreadcrumbsComponent />
        <CompanyTitleEditor
          companyId={companyGet.data.id.toString() || ""}
          initialName={companyGet.data.name || companyGet.data.origin || ""}
          origin={companyGet.data.origin || ""}
        />
        {origin && (
          <Group>
            <Anchor href={origin} target="_blank" variant="transparent" aria-label="Visit company website">
              {new URL(origin).hostname}
            </Anchor>
          </Group>
        )}
      </Stack>
      <ProjectTabs>{children}</ProjectTabs>
    </Stack>
  );
}
