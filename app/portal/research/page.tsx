import { Anchor, Box, Button, Checkbox, Container, Group, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput } from '@mantine/core';
import { RedirectType, useRouter, useSearchParams } from 'next/navigation';

import { EmptyCompanyListState } from '@/ux/components/CompanyList.EmptyState';
import { IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import { redirect } from "next/navigation"
import { serverClient } from '@/shared/supabase-client/server';

export default async function CompaniesPage({ searchParams }: { searchParams: { search?: string } }) {
    const searchTerm = searchParams.search || '';
    const supabase = serverClient();


    const { data: companies, error } = await supabase
        .from('company_profile')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,origin.ilike.%${searchTerm}%`)
        .not('web_summary', 'eq', null)
        .limit(50);

    if (error) {
        console.error('Error fetching companies:', error);
        return <div>Error loading companies</div>;
    }

    const rows = companies.map((company) => (
        <TableTr key={company.id}>

            <TableTd><Checkbox /></TableTd>
            <TableTd>
                <Anchor component={Link} href={`/portal/research/companies/${company.id}/overview`}>
                    {company.name ?? company.origin}
                </Anchor>
            </TableTd>
            <TableTd>{company.origin}</TableTd>
        </TableTr>
    ));

    async function handleSearch(formData: FormData) {
        'use server'
        const search = formData.get('search') as string;
        redirect(`/portal/research?search=${encodeURIComponent(search)}`, RedirectType.replace);
    }

    return (
        <Container size="xl">
            <Paper shadow="xs" p="md" mb="md">
                <form action={handleSearch}>
                    <Group>
                        <TextInput
                            name="search"
                            placeholder="Search by company name or URL"
                            defaultValue={searchTerm}
                            style={{ flex: 1 }}
                        />
                        <Button type="submit" leftSection={<IconSearch size={14} />}>Search</Button>
                    </Group>
                </form>
            </Paper>

            <Table striped highlightOnHover>
                
                    <TableThead>
                        <TableTr>
                            <TableTh></TableTh>
                            <TableTh>Company Name</TableTh>
                            <TableTh>URL</TableTh>
                        </TableTr>
                    </TableThead>
               
                <TableTbody>{rows}</TableTbody>
            </Table>
            {companies?.length === 0 && (
                <EmptyCompanyListState/>
            )}
        </Container>
    );
}
