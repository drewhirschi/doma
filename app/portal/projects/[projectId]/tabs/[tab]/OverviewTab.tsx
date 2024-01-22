"use client"

import { Anchor, Avatar, Badge, Button, Combobox, Container, Group, Input, InputBase, Progress, Select, Space, Table, Text, TextInput, rem } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";
import { AddContractsModalButton } from "./AddContractsModal";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { ReviewerCombobox } from "@/components/ReviewerCombobox";
import { TeamRoleSelect } from "@/components/TeamRoleSelect";
import { useDebouncedCallback } from 'use-debounce';
import { getCompletedContracts, getInitials, getTotalContracts } from "@/helper";

//get real last sign date - from auth-users supabase table?
//how to do active status? do last sign in instead - from auth-users supabase table?

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
                {contract.nPages ?? 1}
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
            </Table.Td>

            <Table.Td>
                <Group gap="sm" grow>
                    {typeof getCompletedContracts(contracts, item.id) === 'number' && typeof getTotalContracts(contracts, item.id) === 'number' ? (
                        <>
                            <Progress value={(getCompletedContracts(contracts, item.id) / getTotalContracts(contracts, item.id)) * 100} />
                            {`${getCompletedContracts(contracts, item.id)}`} / {`${getTotalContracts(contracts, item.id)}`}
                        </>
                    ) : (
                        // Display a message if the values are not valid numbers
                        <Text>Error: Invalid contract values</Text>
                    )}
                </Group>
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
                        <Table.Th>Pages</Table.Th>
                        <Table.Th>Assigned To</Table.Th>

                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{contractsRow}</Table.Tbody>
            </Table>
        </Container>
    )
}