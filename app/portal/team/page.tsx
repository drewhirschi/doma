"use client"

import { Avatar, Select, Tabs, rem } from '@mantine/core';
import { Badge, Button, Card, Container, Grid, Group, Image, Space, Table, Text } from "@mantine/core";
import { IconUserPlus, IconUsers } from '@tabler/icons-react';

import { InviteMemberModal } from './InviteMemberModal';
import { TeamRoleSelect } from '@/components/TeamRoleSelect';

const data = [
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png',
        name: 'Robert Wolfkisser',
        job: 'Engineer',
        email: 'rob_wolf@gmail.com',
        role: 'Admin',
        lastActive: '2 days ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-6.png',
        name: 'Jill Jailbreaker',
        job: 'Engineer',
        email: 'jj@breaker.com',
        role: 'Admin',
        lastActive: '6 days ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
        name: 'Henry Silkeater',
        job: 'Designer',
        email: 'henry@silkeater.io',
        role: 'Associate',
        lastActive: '2 days ago',
        active: false,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
        name: 'Bill Horsefighter',
        job: 'Designer',
        email: 'bhorsefighter@gmail.com',
        role: 'Associate',
        lastActive: '5 days ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
        name: 'Jeremy Footviewer',
        job: 'Manager',
        email: 'jeremy@foot.dev',
        role: 'Associate',
        lastActive: '3 days ago',
        active: false,
    },
];
export default function Page() {

    const iconStyle = { width: rem(12), height: rem(12) };


    const rows = data.map((item) => (
        <Table.Tr key={item.name}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar size={40} src={item.avatar} radius={40} />
                    <div>
                        <Text fz="sm" fw={500}>
                            {item.name}
                        </Text>
                        <Text fz="xs" c="dimmed">
                            {item.email}
                        </Text>
                    </div>
                </Group>
            </Table.Td>

            <Table.Td>
                <TeamRoleSelect defaultValue={item.role} />
            </Table.Td>
            <Table.Td>{item.lastActive}</Table.Td>
            <Table.Td>
                {item.active ? (
                    <Badge fullWidth variant="light">
                        Active
                    </Badge>
                ) : (
                    <Badge color="gray" fullWidth variant="light">
                        Disabled
                    </Badge>
                )}
            </Table.Td>
        </Table.Tr>
    ));

    return (<>
        <Tabs defaultValue="team">
            <Tabs.List mb={"sm"}>
                <Tabs.Tab value="team" leftSection={<IconUsers style={iconStyle} />}>
                    Team
                </Tabs.Tab>
                <Tabs.Tab value="invites" leftSection={<IconUserPlus style={iconStyle} />}>
                    Invites
                </Tabs.Tab>

            </Tabs.List>

            <Tabs.Panel value="team">
                <Container>
                    <Table.ScrollContainer minWidth={800}>
                        <Table verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Employee</Table.Th>
                                    <Table.Th>Role</Table.Th>
                                    <Table.Th>Last active</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Container>
            </Tabs.Panel>

            <Tabs.Panel value="invites">
                <InviteMemberModal />
            </Tabs.Panel>


        </Tabs>
    </>)


}