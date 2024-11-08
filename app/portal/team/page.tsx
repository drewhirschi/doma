import { Avatar, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from "@mantine/core";
import { Badge, Group, Table, Text } from "@mantine/core";

import { InviteMemberModal } from "./InviteMemberModal";
import { getInitials } from "@/ux/helper";
import { serverClient } from "@/shared/supabase-client/server";

export default async function Page() {
  const supabase = serverClient();
  const tenantFetch = await supabase.from("tenant").select("*,profiles:profile(*)").single();

  if (!tenantFetch.data) {
    console.error(tenantFetch.error);
    throw new Error("Failed to fetch tenant data");
  }

  const rows = tenantFetch.data.profiles.map((profile) => (
    <TableTr key={profile.display_name}>
      <TableTd>
        <Group gap="sm">
          {0 ? (
            <Avatar size={40} src={profile.avatar_url}></Avatar>
          ) : (
            <Avatar size={40} color={profile.color!}>
              {getInitials(profile.display_name!)}
            </Avatar>
          )}
          <div>
            <Text fz="sm" fw={500}>
              {profile.display_name}
            </Text>
            <Text fz="xs" c="dimmed">
              {profile.email}
            </Text>
          </div>
        </Group>
      </TableTd>

      <TableTd>
        {profile.email_confirmed_at ? (
          <Badge variant="light" color="green">
            Active
          </Badge>
        ) : (
          <Badge variant="light" color="yellow">
            Invited
          </Badge>
        )}
      </TableTd>
    </TableTr>
  ));

  return (
    <>
      <Title ml={"1rem"}>{tenantFetch.data.name}</Title>
      <Group justify="flex-end">
        <InviteMemberModal />
      </Group>
      <TableScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
          <TableThead>
            <TableTr>
              <TableTh>Name</TableTh>
              <TableTh>Status</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>{rows}</TableTbody>
        </Table>
      </TableScrollContainer>
    </>
  );
}
