import {
  Avatar,
  Progress,
  Select,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Title,
  rem,
} from "@mantine/core";
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Space,
  Table,
  Text,
} from "@mantine/core";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";

import { InviteMemberModal } from "./InviteMemberModal";
import { getInitials } from "@/ux/helper";
import { serverClient } from "@/shared/supabase-client/server";

export default async function Page() {
  const supabase = serverClient();
  const userFetch = await supabase.from("profile").select("*");

  if (!userFetch.data) {
    console.error(userFetch.error);
    throw new Error("Failed to fetch user data");
  }

  const rows = userFetch.data
    // .filter((profile) => profile.email_confirmed_at)
    .map((profile) => (
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
      <Title ml={"1rem"}>Team</Title>
      {/* <Container> */}
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
      {/* </Container> */}
    </>
  );
}
