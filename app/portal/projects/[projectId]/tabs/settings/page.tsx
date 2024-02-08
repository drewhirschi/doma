import MetadataItem from "@/components/MetadataItem";
import { SimpleGrid } from "@mantine/core";
import { serverClient } from "@/supabase/ServerClients";

export default async function SettingsPage({ params }: { params: { projectId: string } }) {

  const supabase = serverClient()

  const { data, error } = await supabase.from("project").select("*").eq("id", params.projectId).single()

  if (error) {
    return <div>Error loading project</div>
  }

  return (
    <div>
      <SimpleGrid>
      <MetadataItem header="Project Id" text={data.id} copyButton />
      <MetadataItem header="Tenant Id" text={data.tenant_id} copyButton />
      </SimpleGrid>
    </div>
  );
}