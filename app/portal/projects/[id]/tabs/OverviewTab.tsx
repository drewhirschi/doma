"use client"

import { Avatar, Badge, Button, Combobox, Container, Group, Input, InputBase, Progress, Select, Space, Table, Text, TextInput, rem } from "@mantine/core";

import { AddContractsModalButton } from "./AddContractsModal";
import { IconSearch } from "@tabler/icons-react";
import { ReviewerCombobox } from "@/components/ReviewerCombobox";
import { TeamRoleSelect } from "@/components/TeamRoleSelect";

export const teamMembers = [
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png',
        name: 'Robert Wolfkisser',
        job: 'Engineer',
        email: "robert@atlas.com",
        role: 'Admin',
        lastActive: '2 days ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
        name: 'Emily Johnson',
        job: 'Designer',
        email: "emily@atlas.com",
        role: 'User',
        lastActive: '1 day ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-11.png',
        name: 'Michael Smith',
        job: 'Developer',
        email: "michael@atlas.com",
        role: 'User',
        lastActive: '3 days ago',
        active: false,
    },
];


interface Props {
    projectId: string
}

export default function OverviewTab({ projectId }: Props) {
   

    const contracts = Array.from({ length: 10 }, (_, index) => (
        <Table.Tr key={index}>


            <Table.Td>
                {`Contract ${index}`}
            </Table.Td>
            <Table.Td>
                No
            </Table.Td>
            <Table.Td>
                4
            </Table.Td>
            <Table.Td>
               <ReviewerCombobox/>
            </Table.Td>

        </Table.Tr>
    ));

    const memberRows = teamMembers.map((item) => (
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
                <Progress value={50} />
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
    return (
        <Container>
            <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Reviewer</Table.Th>
                        <Table.Th>Progress</Table.Th>
                        <Table.Th>Last active</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{memberRows}</Table.Tbody>
            </Table>
            <Space h="lg" />
            <Group justify="space-between">

                <TextInput
                    w={200}
                    placeholder="Search by any field"
                    mb="md"
                    leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                // value={search}
                // onChange={handleSearchChange}
                />

                <AddContractsModalButton projectId={projectId}/>
            </Group>
            <Table >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Contract</Table.Th>
                        <Table.Th>Completed</Table.Th>
                        <Table.Th># SBCs</Table.Th>
                        <Table.Th>Assigned To</Table.Th>

                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{contracts}</Table.Tbody>
            </Table>
        </Container>
    )
}