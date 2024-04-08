"use client"

import { Anchor, Avatar, Badge, Box, Button, Combobox, Container, Divider, Group, Input, InputBase, Pagination, Progress, SegmentedControl, Select, Space, Table, Text, TextInput, rem } from "@mantine/core";
import { getCompletedContracts, getInitials, getTotalContracts } from "@/ux/helper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AddContractsModalButton } from "./ImportModal/AddContractsModal";
import { AgreementTypeBadge } from "@/components/AgreementTypeBadge";
import { AssignContractsModalButton } from "./AssignModal";
import FileExplorer from "@/components/TreeFileExplorer/TreeFileExplorer";
import { FilterPopover } from "./Filter";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { PAGE_SIZE } from "./shared";
import { ReviewerCombobox } from "@/components/ReviewerCombobox";
import { browserClient } from "@/supabase/BrowerClients";
import { useDebouncedCallback } from 'use-debounce';
import { useState } from "react";

interface Props {
    project: Project_SB & { profile: Profile_SB[] }
    contracts: Contract_SB[]
    contractCount: number
}

export default function OverviewTab({ project, contracts, contractCount }: Props) {
    const projectId = project.id
    const members = project.profile

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [selectedRows, setSelectedRows] = useState<string[]>([]);


    const [filesSegment, setFilesSegment] = useState('tree');


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
                        <Anchor href={`/portal/projects/${projectId}/contract/${contract.id}`} component={Link}>
                            {contract.display_name}
                        </Anchor>
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
                    {contract.tag && <AgreementTypeBadge type={contract.tag} />}
                </Table.Td>
                <Table.Td>
                    <ReviewerCombobox projectMembers={members} selectedProfileId={contract.assigned_to} handleUpdate={async (memberId) => {
                        const supabase = browserClient()

                        await supabase.from("contract").update({ assigned_to: memberId }).eq("id", contract.id)
                    }} />
                </Table.Td>

            </Table.Tr>
        ));


    return (
        <Box miw={860} px={"lg"}>

            <Space h="lg" />
            <Group my={"md"} justify="space-between">
                <SegmentedControl
                    value={filesSegment}
                    onChange={setFilesSegment}
                    data={[
                        { value: 'tree', label: 'Files' },
                        { value: 'list', label: 'Search' },
                    ]}
                />
                <Group>
                    <AssignContractsModalButton selectedRows={selectedRows} members={members} pathname={pathname} />
                    <AddContractsModalButton project={project} />
                </Group>

            </Group>
            {filesSegment === 'list' ? (

                <>
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
                            <FilterPopover />
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
                </>

            ) :
                (
                    <FileExplorer
                        members={members}
                        projectId={projectId}
                        root={`projects/${projectId}`}
                        tenantId={project.tenant_id}
                        setSelectedRows={setSelectedRows}
                        selectedRows={selectedRows}

                    />
                    // <div>Tree</div>
                )}
        </Box>
    )
}