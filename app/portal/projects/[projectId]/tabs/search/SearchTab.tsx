"use client"

import { ActionIcon, Box, Group, Pagination, Table, Text, TextInput, Title, rem } from '@mantine/core';

import { AgreementTypeBadge } from '@/components/AgreementTypeBadge';
import { ContractReviewerLink } from '@/components/PdfViewer/components/ContractReveiwerLink';
import { IconDownload } from '@tabler/icons-react';
import { ReviewerCombobox } from '@/components/ReviewerCombobox';
import { SearchAndPage } from '../SearchAndPage';
import { browserClient } from '@/supabase/BrowserClient';
import { notifications } from '@mantine/notifications';

interface Props {
    project: Project_SB & { profile: Profile_SB[] }
    contracts: Contract_SB[]
    contractCount: number
}

export function SearchTab({ project, contracts, contractCount }: Props) {
   

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
                    <ActionIcon variant="filled" aria-label="Download" >
                        <IconDownload style={{ width: '70%', height: '70%' }} stroke={1.5}
                            onClick={async () => {
                                const sb = browserClient();
                                const { data, error } = await sb.storage.from('tenants').download(contract.name);
                                if (error) {
                                    notifications.show({
                                        title: 'Error downloading',
                                        message: error.message,
                                        color: 'red',
                                    });
                                } else {
                                    const url = URL.createObjectURL(data);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = contract.display_name ?? `${contract.id}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }
                            }}
                        />
                    </ActionIcon>
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
                
                <SearchAndPage totalCount={contractCount}/>

            </Group>
            <Table >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Contract</Table.Th>
                        <Table.Th></Table.Th>
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