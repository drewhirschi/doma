import { Avatar, Group, Progress, SimpleGrid, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from "@mantine/core";
import { getCompletedContracts, getInitials, getTotalContracts } from "@/ux/helper";

import MetadataItem from "@/components/MetadataItem";
import { serverClient } from "@/supabase/ServerClients";

export default async function SettingsPage({ params }: { params: { projectId: string } }) {

  const supabase = serverClient()

  const { data, error } = await supabase.from("project")
    .select("*, profile(*)")
    .eq("id", params.projectId)
    .single()

  if (error) {
    return <div>Error loading project</div>
  }

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
          <Progress value={40} />
        {/* <Group gap="sm" grow>
          {typeof getCompletedContracts(contracts, item.id) === 'number' && typeof getTotalContracts(contracts, item.id) === 'number' ? (
            <>
              <Progress value={(getCompletedContracts(contracts, item.id) / getTotalContracts(contracts, item.id)) * 100} />
              {`${getCompletedContracts(contracts, item.id)}`} / {`${getTotalContracts(contracts, item.id)}`}
            </>
          ) : (
            // Display a message if the values are not valid numbers
            <Text>Error: Invalid contract values</Text>
          )}
        </Group> */}
      </TableTd>
    </TableTr>
  ));

  return (
    <div>
      <SimpleGrid>
        <MetadataItem header="Project Id" text={data.id} copyButton />
        <MetadataItem header="Tenant Id" text={data.tenant_id} copyButton />
      </SimpleGrid>
      <Table verticalSpacing="sm">
        <TableThead>
          <TableTr>
            <TableTh>Reviewer</TableTh>
            <TableTh>Progress</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{memberRows}</TableTbody>
      </Table>
    </div>
  );
}