import { Button, Checkbox, Drawer, Group, Table, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';

import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { useDebouncedCallback } from 'use-debounce';
import { useDisclosure } from '@mantine/hooks';

interface Props {

    setCmpId: (id: number) => Promise<void>
}
export function SetTargetPanel(props: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const [companies, setCompanies] = useState<{ id: number, name: string | null, origin: string | null }[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const debouncedSetSearchTerm = useDebouncedCallback(setSearchTerm, 500);

    const sb = browserClient()



    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true)
            const { data, error } = await sb
                .from('company_profile')
                .select("id, name, origin")
                .ilike('name', `%${searchTerm}%`)
                .limit(20)
                .order('name', { ascending: true })

            setLoading(false)

            if (error) {
                setError(true)
                return
            }

            setCompanies(data)
        }

        if (opened) {
            fetchCompanies()
        }
    }, [opened, sb, searchTerm])

    const rows = companies.map((cmp) => (
        <Table.Tr
            key={cmp.name}
            bg={selectedRows.includes(cmp.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedRows.includes(cmp.id)}
                    onChange={(event) =>
                        setSelectedRows(
                            event.currentTarget.checked
                                ? [...selectedRows, cmp.id]
                                : selectedRows.filter((position) => position !== cmp.id)
                        )
                    }
                />
            </Table.Td>
            <Table.Td>{cmp.id}</Table.Td>
            <Table.Td>{cmp.name}</Table.Td>
            <Table.Td>{cmp.origin}</Table.Td>
        </Table.Tr>
    ));


    return (
        <>
            <Drawer opened={opened} onClose={close} title="Set Target" position='right' size={"lg"}>
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
                            <Table.Th>Site</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
                <Group justify='flex-end'>
                    <Button disabled={selectedRows.length !== 1} onClick={async () => {
                        await props.setCmpId(selectedRows[0])
                        close()
                        setSearchTerm("")
                    }}>Save</Button>
                </Group>
            </Drawer>

            <Button onClick={open} >Set Target</Button>
        </>
    );
}