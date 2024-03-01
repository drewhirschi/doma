// import { useEffect, useState } from 'react';

// import { browserClient } from '@/supabase/BrowerClients';
// import { createClient } from '@supabase/supabase-js';

// interface FileExplorerProps {
//     root: string;
//     tenantId: string;
// }

// interface File {
//     name: string;
//     path: string;
//     isDirectory: boolean;
// }

// const FileExplorer: React.FC<FileExplorerProps> = ({ root, tenantId }) => {
//     const [files, setFiles] = useState<File[]>([]);
//     const supabase = browserClient()

//     useEffect(() => {
//         async function fetchFiles() {
//             const { data, error } = await supabase.storage.from(tenantId).list(root);

//             if (error) {
//                 console.error('Error fetching files:', error);
//             } else {
//                 setFiles(data.map((file) => ({
//                     name: file.name,
//                     path: file.path,
//                     isDirectory: file.metadata?.is_directory || false,
//                 })));
//             }
//         }

//         fetchFiles();
//     }, [root]);

//     return (
//         <div>
//             <h2>File Explorer</h2>
//             <ul>
//                 {files.map((file) => (
//                     <li key={file.path}>
//                         {file.isDirectory ? (
//                             <strong>{file.name}</strong>
//                         ) : (
//                             <span>{file.name}</span>
//                         )}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default FileExplorer;

import { Anchor, Box, Button, Group, Stack, Table, Text, Title, UnstyledButton } from '@mantine/core';
import { useEffect, useState } from 'react';

import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { browserClient } from '@/supabase/BrowerClients';
import { s } from 'vitest/dist/reporters-1evA5lom';

interface FileItem {
    id: string;
    name: string;
    path: string;
    isDirectory: boolean;
}

interface FileExplorerProps {
    root: string;
    tenantId: string;
    projectId: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ root, tenantId, projectId }) => {
    const [currentPath, setCurrentPath] = useState<string>(root);
    const [items, setItems] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = browserClient()

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            // Assuming 'list' is a method to fetch files; replace with actual Supabase Storage method
            const { data, error } = await supabase.storage.from(tenantId).list(currentPath, {
                limit: 100, // Adjust based on your needs
                offset: 0,
            });

            if (error) {
                console.error('Error fetching files:', error);
                return;
            }

            // Transform fetched data to FileItem format, assuming data has fields indicating if an item is a directory
            const transformedItems = data?.filter(item => !item.name.includes(".emptyFolderPlaceholder")).map((item) => ({
                id: item.id,
                name: item.name,
                path: `${currentPath}/${item.name}`,
                isDirectory: item.id == null, // Adjust based on how your data indicates directories
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

    const navigateUp = () => {
        const upOneLevel = currentPath.substring(0, currentPath.lastIndexOf('/'));
        setCurrentPath(upOneLevel || root);
    };

    return (
        <Box>
            <Group>

            {/* <Button
             variant='subtle'
              disabled={currentPath == `projects/${projectId}`}
              onClick={() => setCurrentPath(`projects/${projectId}`)}
              >/</Button> */}
            {currentPath.replace(`projects/${projectId}`, "")
            .split('/')
            .filter(pathItem => !!pathItem).map((path, index) => (<Group key={index}> <IconChevronRight size={16}/> <Button variant="subtle">{path}</Button></Group>))}
            </Group>
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <>
                        {currentPath !== root &&

                            <Table.Tr >
                                <Table.Td>
                                    <UnstyledButton onClick={navigateUp}>
                                        ←
                                    </UnstyledButton>
                                </Table.Td>
                            </Table.Tr>
                        }
                        {items.map((item) => {

                            return (
                                <Table.Tr key={item.id}>
                                    <Table.Td>
                                        {item.isDirectory ?
                                            <UnstyledButton onClick={() => handleItemClick(item)}>
                                                {`📁 ${item.name}`}
                                            </UnstyledButton>
                                            :

                                            item.name.toLowerCase().endsWith(".pdf") ? (
                                                <Anchor href={`/portal/projects/${projectId}/contract/${item.id}`} component={Link}>
                                                    {'📄 ' + item.name}
                                                </Anchor>
                                            ) : (
                                                <Text>{'📄 ' + item.name}</Text>
                                            )
                                        }

                                    </Table.Td>
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
