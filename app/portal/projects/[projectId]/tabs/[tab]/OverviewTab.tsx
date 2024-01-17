"use client"

import { Anchor, Avatar, Badge, Button, Combobox, Container, Group, Input, InputBase, Progress, Select, Space, Table, Text, TextInput, rem } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AddContractsModalButton } from "./AddContractsModal";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { ReviewerCombobox } from "@/components/ReviewerCombobox";
import { TeamRoleSelect } from "@/components/TeamRoleSelect";
import { useDebouncedCallback } from 'use-debounce';
import { getInitials } from "@/helper";

interface Props {
    project: Project_SB & { profile: Profile_SB[], contract: Contract_SB[] }

}

export default function OverviewTab({ project }: Props) {
    const projectId = project.id
    const members = project.profile
    const contracts = project.contract


    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const debouncedHandleSearch = useDebouncedCallback((value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('query', value);
        } else {
            params.delete('query');
        }

        replace(`${pathname}?${params.toString()}`);
    }, 300)


    const contractsRow = contracts.map((contract: any) => (
        <Table.Tr key={contract.id}>


            <Table.Td>
                <Anchor href={`/portal/projects/${projectId}/contract/${contract.id}`} component={Link}>

                    {contract.display_name}
                </Anchor>
            </Table.Td>
            <Table.Td>
                {contract.completed ? "Yes" : "No"}
            </Table.Td>
            <Table.Td>
                fix me
            </Table.Td>
            <Table.Td>
                <ReviewerCombobox projectMembers={members} selectedProfileId={contract.assigned_to} contractId={contract.id} />
            </Table.Td>

        </Table.Tr>
    ));

    const memberRows = members.map((item) => (
        <Table.Tr key={item.display_name}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar size={40} src={item.avatar_url} color={item.color!} radius={40}>{getInitials(item.display_name!)}</Avatar>
                    <div>
                        <Text fz="sm" fw={500}>
                            {item.display_name}
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
            <Table.Td>{new Date().toLocaleDateString()}</Table.Td>
            <Table.Td>
                {true ? (
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
                    placeholder="Search"
                    mb="md"
                    leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                    defaultValue={searchParams.get('query')?.toString()}
                    onChange={(event) => debouncedHandleSearch(event.currentTarget.value)}
                />

                <AddContractsModalButton project={project} />
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
                <Table.Tbody>{contractsRow}</Table.Tbody>
            </Table>
        </Container>
    )
}