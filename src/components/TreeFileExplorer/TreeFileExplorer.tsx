import { Anchor, Box, Button, Checkbox, Group, Stack, Table, Text, Title, UnstyledButton } from '@mantine/core';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
    selectedRows: string[];
    setSelectedRows: (rows: string[]) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ root, tenantId, projectId, members, selectedRows, setSelectedRows }) => {
    const supabase = browserClient()
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [currentPath, setCurrentPath] = useState<string>(searchParams.get("path") ?? root);
    const [items, setItems] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);


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
            const transformedItems = data?.filter(item => !item.name.includes(".emptyFolderPlaceholder")).map((item, idx) => ({
                id: item.id ?? idx.toString(),
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

    const updatePathParam = (value: string) => {
        //@ts-ignore
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('path', value);
        } else {
            params.delete('path');
        }

        replace(`${pathname}?${params.toString()}`);
    }

    const handleItemClick = (item: FileItem) => {
        if (item.isDirectory) {
            setSelectedRows([])
            updatePathParam(item.path)
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
        updatePathParam(upPath || root)
        setCurrentPath(upPath || root);
    };

    const selectCell = (item: FileItem) => (
        <Table.Td>
            <Checkbox
                aria-label="Select row"
                checked={selectedRows.includes(item.path)}
                onChange={(event) =>
                    setSelectedRows(
                        event.currentTarget.checked
                            ? [...selectedRows, item.path]
                            : selectedRows.filter((id) => id !== item.path)
                    )
                }
            />
        </Table.Td>
    )

    const renderFolder = (item: FileItem) => {
        return (
            <>
                {selectCell(item)}
                <Table.Td>
                    <UnstyledButton onClick={() => handleItemClick(item)} className={classnames.folderText}>
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
                {selectCell(item)}
                <Table.Td>
                    {item.name.toLowerCase().endsWith(".pdf") ? (
                        <Anchor href={`/portal/projects/${projectId}/contract/${item.id}`} component={Link}>
                            {'📄 ' + item.metadata?.display_name ?? item.name}
                        </Anchor>
                    ) : (
                        <>
                            {'📄 ' + item.metadata?.display_name ?? item.name}
                        </>
                    )}
                </Table.Td>
                <Table.Td>{item.metadata?.description}</Table.Td>
                <Table.Td> {item.metadata?.completed ? "Yes" : "No"}</Table.Td>
                <Table.Td>{item.metadata?.npages ?? 1}</Table.Td>
                <Table.Td>{item.metadata?.tag && <AgreementTypeBadge type={item.metadata?.tag} />}</Table.Td>
                <Table.Td>
                    <ReviewerCombobox projectMembers={members} selectedProfileId={item.metadata?.assigned_to} handleUpdate={(async (memberId) => {
                        const supabase = browserClient()

                        await supabase.from("contract").update({ assigned_to: memberId }).eq("id", item.id)
                    })} />
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
            <Table
            //  highlightOnHover
            >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th> <Checkbox
                            aria-label="Select all rows"
                            checked={selectedRows.length === items.length && items.length > 0}
                            onChange={(event) =>
                                setSelectedRows(selectedRows.length == 0 ? items.map((item) => item.path) : [])
                            }
                        /></Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Completed</Table.Th>
                        <Table.Th>Pages</Table.Th>
                        <Table.Th>Agreement Type</Table.Th>
                        <Table.Th>Assigned To</Table.Th>
                    </Table.Tr>
                </Table.Thead>
               
                    <Table.Tbody>

                        {items.map((item) => {

                            return (
                                <Table.Tr key={item.id} onClick={() => {
                                    // console.log(`clicked ${item.name}`)
                                    // setSelectedRows(
                                    //     !selectedRows.includes(item.id)
                                    //         ? [...selectedRows, item.id]
                                    //         : selectedRows.filter((id) => id !== item.id)
                                    // )
                                }}>
                                    {item.isDirectory ? renderFolder(item) : renderFile(item)}


                                </Table.Tr>

                            )
                        })}
                    </Table.Tbody>
                
            </Table>
            {loading && (
                    <Text>Loading...</Text>)}

        </Box>
    );
};

export default FileExplorer;
