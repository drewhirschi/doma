import { Anchor, Box, Button, Group, Stack, Table, Text, Title, UnstyledButton } from '@mantine/core';
import { useEffect, useState } from 'react';

import { AgreementTypeBadge } from '../AgreementTypeBadge';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { ReviewerCombobox } from '../ReviewerCombobox';
import { browserClient } from '@/supabase/BrowerClients';
import classnames from "./FileExplorer.module.css"

interface FileItem {
    id: string;
    name: string;
    path: string;
    isDirectory: boolean;
    metadata?: Contract_SB
}

interface FileExplorerProps {
    root: string;
    tenantId: string;
    projectId: string;
    members: Profile_SB[]
}

const FileExplorer: React.FC<FileExplorerProps> = ({ root, tenantId, projectId, members }) => {
    const [currentPath, setCurrentPath] = useState<string>(root);
    const [items, setItems] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = browserClient()

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            // Assuming 'list' is a method to fetch files; replace with actual Supabase Storage method
            const [{ data, error }, contractq] = await Promise.all([
                supabase.storage.from(tenantId).list(currentPath, {
                    limit: 100, // Adjust based on your needs
                    offset: 0,
                }),

                supabase.from("contract")
                    .select()
                    .ilike("name", `${currentPath}/%`)
                    .not("name", "ilike", `${currentPath}/%/%`)
            ]);



            if (error || contractq.error) {
                console.error('Error fetching files:', error);
                return;
            }

            // Transform fetched data to FileItem format, assuming data has fields indicating if an item is a directory
            const transformedItems = data?.filter(item => !item.name.includes(".emptyFolderPlaceholder")).map((item) => ({
                id: item.id,
                name: item.name,
                path: `${currentPath}/${item.name}`,
                isDirectory: item.id == null, // Adjust based on how your data indicates directories
                metadata: contractq.data.find((contract: Contract_SB) => contract.id == item.id)
            })) ?? [];

            setItems(transformedItems);
            setLoading(false);
        };

        fetchFiles();
    }, [currentPath]);

    const handleItemClick = (item: FileItem) => {
        if (item.isDirectory) {
            setCurrentPath(item.path);
        } else {
            // Handle file click, e.g., preview or download
        }
    };



    const navigateUp = (numFolders: number = 1) => {
        let upPath = currentPath;
        for (let i = 0; i < numFolders; i++) {
            upPath = upPath.substring(0, upPath.lastIndexOf('/'));
        }
        setCurrentPath(upPath || root);
    };

    const renderFolder = (item: FileItem) => {
        return (
            <>
                <Table.Td>
                    <UnstyledButton onClick={() => handleItemClick(item)} className={classnames.folderButton}>
                        {`📁 ${item.name}`}
                    </UnstyledButton>
                </Table.Td>
                <Table.Td></Table.Td>
                <Table.Td></Table.Td>
                <Table.Td></Table.Td>
                <Table.Td></Table.Td>
                <Table.Td></Table.Td>
            </>
        );
    };

    const renderFile = (item: FileItem) => {
        return (
            <>
                <Table.Td>
                    {item.name.toLowerCase().endsWith(".pdf") ? (
                        <Anchor href={`/portal/projects/${projectId}/contract/${item.id}`} component={Link}>
                            {'📄 ' + item.name}
                        </Anchor>
                    ) : (
                        <Text>{'📄 ' + item.name}</Text>
                    )}
                </Table.Td>
                <Table.Td>{item.metadata?.description}</Table.Td>
                <Table.Td> {item.metadata?.completed ? "Yes" : "No"}</Table.Td>
                <Table.Td>{item.metadata?.npages ?? 1}</Table.Td>
                <Table.Td>{item.metadata?.tag && <AgreementTypeBadge type={item.metadata?.tag}/>}</Table.Td>
                <Table.Td>
                    <ReviewerCombobox projectMembers={members} selectedProfileId={item.metadata?.assigned_to} contractId={item.id} />
                </Table.Td>
            </>
        );
    };





    return (
        <Box>
            <Group>


                {currentPath.replace(`projects/${projectId}`, "Home")
                    .split('/')

                    .map((path, index, array) => {

                        if (index === array.length - 1) {

                            return (<Group key={index}> {index != 0 && <IconChevronRight size={16} />}
                                <Text className={classnames.lastPathSegment}>{path}</Text>
                            </Group>)
                        }

                        return (<Group key={index}>  {index != 0 && <IconChevronRight size={16} />} <UnstyledButton
                            onClick={() => navigateUp(array.length - index - 1)}
                            className={classnames.pathButton}
                        >{path}</UnstyledButton></Group>)
                    })
                }

            </Group>
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Completed</Table.Th>
                        <Table.Th>Pages</Table.Th>
                        <Table.Th>Agreement Type</Table.Th>
                        <Table.Th>Assigned To</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <>

                        {items.map((item) => {

                            return (
                                <Table.Tr key={item.id}>
                                    {item.isDirectory ? renderFolder(item) : renderFile(item)}


                                </Table.Tr>

                            )
                        })}
                    </>
                )}</Table.Tbody>
            </Table>

        </Box>
    );
};

export default FileExplorer;
