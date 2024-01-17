import { Avatar, Select, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr, Tabs, TabsList, TabsPanel, TabsTab, rem } from '@mantine/core';
import { Badge, Button, Card, Container, Grid, Group, Image, Space, Table, Text } from "@mantine/core";
import { IconUserPlus, IconUsers } from '@tabler/icons-react';

import { InviteMemberModal } from './InviteMemberModal';
import { TeamRoleSelect } from '@/components/TeamRoleSelect';
import { serverClient } from "@/supabase/ServerClients";
import { getInitials } from '@/helper';

const role = 'Admin' //add these to profile table if desired
const lastActive = '2 days ago' //add these to profile table if desired
const active = true //add these to profile table if desired

export default async function Page() {

    const supabase = serverClient()
    const userFetch = await supabase.from("profile").select("*")

    if (!userFetch.data) {
        console.error(userFetch.error)
        throw new Error("Failed to fetch data")
    }

    const iconStyle = { width: rem(12), height: rem(12) };

    //build pending invite table and populate with people who do not have their email confirmed

    const rows = userFetch.data
        .filter((profile) => profile.email_confirmed_at)
        .map((profile) => (
            <TableTr key={profile.display_name}>
                <TableTd>
                    <Group gap="sm">
                        <Avatar src={profile.avatar_url} color={profile.color!} radius="xl">{getInitials(profile.display_name!)}</Avatar>
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
                    <TeamRoleSelect defaultValue={role} />
                </TableTd>
                <TableTd>{lastActive}</TableTd>
                <TableTd>
                    {active ? (
                        <Badge fullWidth variant="light">
                            Active
                        </Badge>
                    ) : (
                        <Badge color="gray" fullWidth variant="light">
                            Disabled
                        </Badge>
                    )}
                </TableTd>
            </TableTr>
        ));

    const inviteRows = userFetch.data
        .filter((profile) => !profile.email_confirmed_at)
        .map((item) => (
            <TableTr key={item.email}>
                <TableTd>{item.email}</TableTd>
                <TableTd>{item.invited_at}</TableTd>
                <TableTd>
                    <Badge color="gray" fullWidth variant="light">
                        Pending
                    </Badge>
                </TableTd>
            </TableTr>
        ));

    return (<>
        <Tabs defaultValue="team">
            <TabsList mb={"sm"}>
                <TabsTab value="team" leftSection={<IconUsers style={iconStyle} />}>
                    Team
                </TabsTab>
                <TabsTab value="invites" leftSection={<IconUserPlus style={iconStyle} />}>
                    Invites
                </TabsTab>

            </TabsList>

            <TabsPanel value="team">
                <Container>
                    <TableScrollContainer minWidth={800}>
                        <Table verticalSpacing="sm">
                            <TableThead>
                                <TableTr>
                                    <TableTh>Employee</TableTh>
                                    <TableTh>Role</TableTh>
                                    <TableTh>Last active</TableTh>
                                    <TableTh>Status</TableTh>
                                </TableTr>
                            </TableThead>
                            <TableTbody>{rows}</TableTbody>
                        </Table>
                    </TableScrollContainer>
                </Container>
            </TabsPanel>

            <TabsPanel value="invites">
                <InviteMemberModal />
            </TabsPanel>


            <TabsPanel value="invites">
                <Container>
                    <TableScrollContainer minWidth={800}>
                        <Table verticalSpacing="sm">
                            <TableThead>
                                <TableTr>
                                    <TableTh>Email</TableTh>
                                    <TableTh>Invite Sent</TableTh>
                                    <TableTh>Status</TableTh>
                                </TableTr>
                            </TableThead>
                            <TableTbody>{inviteRows}</TableTbody>
                        </Table>
                    </TableScrollContainer>
                </Container>
            </TabsPanel>

        </Tabs>
    </>)


}