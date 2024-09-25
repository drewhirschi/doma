'use client'

import { Button, Checkbox, Group, Modal, Table, TextInput } from '@mantine/core';

import { IconPlus } from '@tabler/icons-react';
import { actionWithNotification } from '@/ux/clientComp';
import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { useDebouncedCallback } from 'use-debounce';
import { useDisclosure } from '@mantine/hooks';
import { useSBFetch } from '@/ux/hooks';
import { useState } from 'react';

export function AddToDealModal({ selectedCompanies }: { selectedCompanies: number[] }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("")
    const debouncedSetSearchTerm = useDebouncedCallback(setSearchTerm, 500);

    const sb = browserClient()
    const { data: ibProjects, error, loading } = useSBFetch(() => sb.from('ib_projects').select('*'));

    if (error) {
        console.error('Error fetching IB projects:', error);
        return <p>Error</p>
    }

    if (loading) {
        return <p>Loading...</p>
    }

    const rows = ibProjects?.map((project) => (
        <Table.Tr
            key={project.id}
            bg={selectedProject == project.id ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedProject == project.id}
                    onChange={(event) =>
                        setSelectedProject(
                            event.currentTarget.checked
                                ? project.id
                                : null
                        )
                    }
                />
            </Table.Td>
            <Table.Td>{project.id}</Table.Td>
            <Table.Td>{project.title}</Table.Td>
            {/* <Table.Td>{project.}</Table.Td> */}
        </Table.Tr>
    ));

    return (
        <>
            <Modal opened={opened} onClose={close} title="Add companies to deal">
                {error && <p>Error</p>}
                {loading && <p>Loading...</p>}

                <TextInput
                    placeholder="Search by name"
                    onChange={(e) => debouncedSetSearchTerm(e.currentTarget.value)}
                />

                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th />
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Name</Table.Th>
                            {/* <Table.Th>Site</Table.Th> */}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
                <Group justify='flex-end'>
                    <Button disabled={selectedProject == null} onClick={async () => {
                        const dealComps = selectedCompanies.map(sr => ({ cmp_id: sr, project_id: selectedProject as number }))
                        const insert =  sb.from("deal_comps").insert(dealComps).throwOnError()
                        actionWithNotification(async () => await insert)
                        close()
                        setSearchTerm("")
                    }}>Save</Button>
                </Group>
            </Modal>

            <Button
                m={"xs"}
                mb={0}
                onClick={open}
                disabled={selectedCompanies.length === 0}
                leftSection={<IconPlus size={14} />}
                variant='white'
            >
                Add to Deal
            </Button>
        </>
    );
}