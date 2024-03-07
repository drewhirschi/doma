import { Avatar, Box, Group, Progress, SimpleGrid, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from "@mantine/core";
import { getCompletedContracts, getInitials, getTotalContracts } from "@/ux/helper";

import MetadataItem from "@/components/MetadataItem";
import { serverClient } from "@/supabase/ServerClients";

export default async function SettingsPage({ params }: { params: { projectId: string } }) {

    const sb = serverClient()
  const [] = await Promise.all([
    sb.from("formatted_info").select("*, contract(project_id)")
    .eq("contract.project_id", params.projectId)
    .eq("formatter_key", "nomCompete")
    ]);

  return (
    <Box>
      
    </Box>
  );
}