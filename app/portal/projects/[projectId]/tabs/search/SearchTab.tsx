"use client"

import { Anchor, Avatar, Box, Button, Container, Grid, Group, Pagination, Select, SimpleGrid, Space, Table, Tabs, TabsList, TabsPanel, TabsTab, Text, TextInput, Title, rem } from '@mantine/core';
import { IconSearch, IconSettings } from '@tabler/icons-react';
import { RedirectType, redirect, usePathname, useRouter, useSearchParams, } from 'next/navigation';

import { AgreementTypeBadge } from '@/components/AgreementTypeBadge';
import { ContractReviewerLink } from '@/components/PdfViewer/components/ContractReveiwerLink';
import { FilterPopover } from '../overview/Filter';
import Link from 'next/link';
import { PAGE_SIZE } from './shared';
import { ReviewerCombobox } from '@/components/ReviewerCombobox';
import { browserClient } from '@/supabase/BrowerClients';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
    project: Project_SB & { profile: Profile_SB[] }
    contracts: Contract_SB[]
    contractCount: number
}

export function SearchTab({ project, contracts, contractCount }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const debouncedHandleSearch = useDebouncedCallback((value: string) => {
        //@ts-ignore
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('query', value);
        } else {
            params.delete('query');
        }

        replace(`${pathname}?${params.toString()}`);
    }, 300)

    function updatePage(value: number) {
        //@ts-ignore
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('page', value.toString());
        } else {
            params.delete('page');
        }

        replace(`${pathname}?${params.toString()}`);
    }

    const contractsRow = contracts
        .filter(item => !item.name.includes(".emptyFolderPlaceholder"))
        .map((contract: Contract_SB) => (
            <Table.Tr key={contract.id}>


                <Table.Td>
                    {contract.name?.toLowerCase().endsWith(".pdf") ? (
                        <ContractReviewerLink
                            contractId={contract.id}
                            projectId={project.id}
                            from={'search'}
                        >{contract.display_name ?? ""}</ContractReviewerLink>
                    ) : (
                        <Text>{contract.display_name}</Text>
                    )}

                </Table.Td>
                <Table.Td>
                    {contract.description}
                </Table.Td>
                <Table.Td>
                    {contract.completed ? "Yes" : "No"}
                </Table.Td>
                <Table.Td>
                    {contract.npages ?? 1}
                </Table.Td>
                <Table.Td>
                    {contract.tag && <AgreementTypeBadge type={contract.tag}  contractId={contract.id}/>}
                </Table.Td>
                <Table.Td>
                    <ReviewerCombobox projectMembers={project.profile} selectedProfileId={contract.assigned_to} handleUpdate={async (memberId) => {
                        const supabase = browserClient()

                        await supabase.from("contract").update({ assigned_to: memberId }).eq("id", contract.id)
                    }} />
                </Table.Td>

            </Table.Tr>
        ));

    return (
        <Box p={"lg"}>
            <Group justify="space-between">
                <Group align="baseline">

                    <TextInput
                        w={200}
                        placeholder="Search"
                        mb="md"
                        leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        defaultValue={searchParams.get('query')?.toString()}
                        onChange={(event) => debouncedHandleSearch(event.currentTarget.value)}
                    />
                    <Pagination total={contractCount / PAGE_SIZE} value={Number(searchParams.get("page") ?? 1)} onChange={updatePage} />
                    <FilterPopover projectId={project.id} />
                </Group>

            </Group>
            <Table >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Contract</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Completed</Table.Th>
                        <Table.Th>Pages</Table.Th>
                        <Table.Th>Agreement Type</Table.Th>
                        <Table.Th>Assigned To</Table.Th>

                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{contractsRow}</Table.Tbody>
            </Table>
        </Box>
    );
}