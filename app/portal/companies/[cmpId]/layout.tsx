import { Group, Stack, Title } from "@mantine/core";
import { BreadcrumbsComponent } from "@/ux/components/Breadcrumbs";
import { ProjectTabs } from "./ProjectTabs";
import { serverClient } from "@/shared/supabase-client/server";
import { CompanyTitleEditor } from "@/ux/components/CompanyTitleEditor";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { cmpId: string };
}) {
  const companyGet = await serverClient()
    .from("company_profile")
    .select("*")
    .eq("id", params.cmpId)
    .single();

  if (companyGet.error) {
    console.log(companyGet.error);
    return <Title>Not found</Title>;
  }

  const breadcrumbsItems = [
    { label: "< Companies", href: "/portal/companies" },
  ];

  return (
    <Stack h={"100vh"} gap={0} w="calc(100vw - 60px)">
      <Group p="sm" mb={"sm"} miw={860}>
        <BreadcrumbsComponent items={breadcrumbsItems} />
        <CompanyTitleEditor
          companyId={companyGet.data.id.toString() || ""}
          initialName={companyGet.data.name || ""}
          origin={companyGet.data.origin || ""}
        />
      </Group>
      <ProjectTabs>{children}</ProjectTabs>
    </Stack>
  );
}