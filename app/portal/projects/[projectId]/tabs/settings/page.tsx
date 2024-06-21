import { Avatar, Box, Button, Group, Progress, SimpleGrid, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from "@mantine/core";
import { IResp, rerm, rok } from "@/utils";
import { getCompletedContracts, getInitials, getTotalContracts } from "@/ux/helper";
import { serverActionClient, serverClient } from "@/supabase/ServerClients";

import { AddReviewersPanel } from "./AddReviewersPanel";
import MetadataItem from "@/components/MetadataItem";
import { ProjectActionButtons } from "./ProjectActionButtons";
import axios from "axios";
import { convertProjectWordFiles } from "@/actions/convertWordFiles";
import { getUserTenant } from "@/shared/getUserTenant";
import { queueProjectContracts } from "@/actions/queueProject";
import { revalidatePath } from "next/cache";

export default async function SettingsPage({ params }: { params: { projectId: string } }) {

  const supabase = serverClient()



  const { data, error } = await supabase.from("project")
    .select("*, profile(*)")
    .eq("id", params.projectId)
    .single()

  const contractsTotal = await supabase
    .from('contract')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', params.projectId)
    .ilike('name', '%.pdf')
  const contractsParsed = await supabase
    .from('contract')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', params.projectId)
    .eq('linified', true)
    .ilike('name', '%.pdf')

    const tenantMembers = await supabase.from("profile").select("*")


    async function updateProjectAssignments(addedIds: string[], removedIds: string[]): Promise<IResp<any>> {
      "use server"
      const sb = serverActionClient()
      const { error: insertErr } = await sb
        .from('project_assignment')
        .insert(addedIds.map(id => ({ project_id: params.projectId, profile_id: id })))


      const { error: deleteErr } = await sb.from('project_assignment').delete().in('profile_id', removedIds).eq('project_id', params.projectId)

      if (insertErr || deleteErr) {
        return rerm("Failed to update assignments", { insertErr, deleteErr })
      }

      revalidatePath(`/portal/projects/${params.projectId}`)
      return rok(null)
    }


  if (error) {
    return <div>Error loading project</div>
  }

  // @ts-ignore
  const memberRows = data.profile?.map((item) => (
    <TableTr key={item.display_name}>
      <TableTd>
        <Group gap="sm">
          {0 ? (
            <Avatar size={40} src={item.avatar_url}></Avatar>
          ) : (
            <Avatar size={40} color={item.color!}>{getInitials(item.display_name!)}</Avatar>
          )}
          <div>
            <Text fz="sm" fw={500}>
              {item.display_name}
            </Text>
          </div>
        </Group>
      </TableTd>

      <TableTd>
        {/* <Progress value={40} /> */}
        
      </TableTd>
    </TableTr>
  ));

  return (
    <Box p={"sm"}>
      <ProjectActionButtons projectId={params.projectId} />
      <SimpleGrid cols={4} >
        <MetadataItem header="Project Id" text={data.id} copyButton />
        <MetadataItem header="Tenant Id" text={data.tenant_id} copyButton />
        <MetadataItem header="Parsed contracts" text={`${contractsParsed.count}/${contractsTotal.count}`} />

      </SimpleGrid>
      <Group justify="flex-end">

      <AddReviewersPanel members={tenantMembers.data ?? []} project={data} updateProjectAssignments={updateProjectAssignments}/>
      </Group>
      <Table verticalSpacing="sm">
        <TableThead>
          <TableTr>
            <TableTh>Reviewer</TableTh>
            <TableTh>Progress</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{memberRows}</TableTbody>
      </Table>
      
    </Box>
  );
}