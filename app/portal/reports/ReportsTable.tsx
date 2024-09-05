'use client';

import { Anchor, Avatar, Checkbox, Group, ScrollArea, Table, Text, rem } from '@mantine/core';

import Link from 'next/link';
import { useState } from 'react';

interface IReportsTableProps {
    reports: any[]
}


export default function ReportsTable({ reports }: IReportsTableProps) {
    const [selection, setSelection] = useState(['1']);
    const toggleRow = (id: string) =>
        setSelection((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    const toggleAll = () =>
        setSelection((current) => (current.length === reports.length ? [] : reports.map((item) => item.id)));

    const rows = reports.map((item) => {
        const selected = selection.includes(item.id);
        return (
            <Table.Tr key={item.id} >
                <Table.Td>
                    <Checkbox checked={selection.includes(item.id)} onChange={() => toggleRow(item.id)} />
                </Table.Td>
                <Table.Td>
                    <Anchor
                        c={"dark"}
                        fw={500}
                        component={Link}
                        href={`/portal/reports/${item.id}/v1`}>

                        {item.display_name}
                    </Anchor>
                </Table.Td>
                <Table.Td>{item.topic}</Table.Td>
            </Table.Tr>
        );
    });

    return (
        <ScrollArea>
            <Table miw={800} verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ width: rem(40) }}>
                            <Checkbox
                                onChange={toggleAll}
                                checked={selection.length === reports.length}
                                indeterminate={selection.length > 0 && selection.length !== reports.length}
                            />
                        </Table.Th>
                        <Table.Th>Title</Table.Th>
                        <Table.Th>Industry</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </ScrollArea>
    );
}