"use client"

import { Anchor, Avatar, Badge, Box, Button, Combobox, Container, Group, Input, InputBase, Pagination, Progress, SegmentedControl, Select, Space, Table, Text, TextInput, rem } from "@mantine/core";
import { getCompletedContracts, getInitials, getTotalContracts } from "@/ux/helper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AddContractsModalButton } from "./ImportModal/AddContractsModal";
import FileExplorer from "@/components/TreeFileExplorer/TreeFileExplorer";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { PAGE_SIZE } from "./shared";
import { ReviewerCombobox } from "@/components/ReviewerCombobox";
import { useDebouncedCallback } from 'use-debounce';
import { useState } from "react";

function getAgreementBadge(type: string) {
    switch (type) {
        case 'customer_agreement':
            return <Badge color='teal'>Customer</Badge>;
        case 'joint_development_agreement':
            return <Badge color="pink">Joing development</Badge>;
        case 'employee_agreement':
            return <Badge color="orange">Employee</Badge>;
        // case 'license_agreement':
        //     return 'indigo';
        default:
            return <Badge color="gray">Unknown</Badge>;
    }
}

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
                    {contract.display_name?.toLowerCase().endsWith(".pdf") ? (
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
                    {/* @ts-ignore */}
                    {contract.npages ?? 1}
                </Table.Td>
                <Table.Td>
                    {contract.tag && getAgreementBadge(contract.tag)}
                </Table.Td>
                <Table.Td>
                    <ReviewerCombobox projectMembers={members} selectedProfileId={contract.assigned_to} contractId={contract.id} />
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
                <AddContractsModalButton project={project} />

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
                    <FileExplorer projectId={projectId} root={`projects/${projectId}`} tenantId={project.tenant_id} />
                )}
        </Box>
    )
}