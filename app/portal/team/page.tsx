import { Progress, Avatar, Select, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr, Tabs, TabsList, TabsPanel, TabsTab, rem } from '@mantine/core';
import { Badge, Button, Card, Container, Grid, Group, Image, Space, Table, Text } from "@mantine/core";
import { IconUserPlus, IconUsers } from '@tabler/icons-react';

import { InviteMemberModal } from './InviteMemberModal';
import { TeamRoleSelect } from '@/components/TeamRoleSelect';
import { serverClient } from "@/supabase/ServerClients";
import { getCompletedContracts, getInitials, getTotalContracts } from '@/helper';

export default async function Page() {

    const load = 0
    const supabase = serverClient()
    const userFetch = await supabase.from("profile").select("*")
    const contractFetch = await supabase.from("contract").select("*")

    if (!userFetch.data) {
        console.error(userFetch.error)
        throw new Error("Failed to fetch user data")
    }

    if (!contractFetch.data) {
        console.error(userFetch.error)
        throw new Error("Failed to fetch contract data")
    }

    const iconStyle = { width: rem(12), height: rem(12) };

    const rows = userFetch.data
        .filter((profile) => profile.email_confirmed_at)
        .map((profile) => (
            <TableTr key={profile.display_name}>
                <TableTd>
                    <Group gap="sm">
                        {0 ? (
                            <Avatar size={40} src={profile.avatar_url}></Avatar>
                        ) : (
                            <Avatar size={40} color={profile.color!}>{getInitials(profile.display_name!)}</Avatar>
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
                    <Group gap="sm" grow>
                        {typeof getCompletedContracts(contractFetch.data, profile.id) === 'number' && typeof getTotalContracts(contractFetch.data, profile.id) === 'number' ? (
                            <>
                                <Progress value={(getCompletedContracts(contractFetch.data, profile.id) / getTotalContracts(contractFetch.data, profile.id)) * 100} />
                                {`${getCompletedContracts(contractFetch.data, profile.id)}`} / {`${getTotalContracts(contractFetch.data, profile.id)}`}
                            </>
                        ) : (
                            // Display a message if the values are not valid numbers
                            <Text>Error: Invalid contract values</Text>
                        )}
                    </Group>
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
                                    <TableTh>Assigned Contracts</TableTh>
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