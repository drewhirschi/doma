import { IconAlertCircle, IconChevronLeft, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSettings } from '@tabler/icons-react';
import { RedirectType, redirect, } from 'next/navigation';
import { Table, TableTbody, TableTd, TableTh, TableThead, TableTr, } from '@mantine/core';

import { BackButton } from '@/components/BackButton';
import Link from 'next/link';
import { PAGE_SIZE } from '../shared';
import { ProjectTabs } from '../ProjectTabs';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params, searchParams }: { params: { projectId: string }, searchParams: { query: string, page: number } }) {

    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) - 1 || 0;

    const supabase = serverClient()

    const transactionsGet = await supabase
        .from('transaction_search_res')
        .select('*, transaction_participant(*)')
    // .eq('project_id', params.projectId)
    // .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (transactionsGet.error) {
        throw new Error(transactionsGet.error.message)
    }

    const transactions = transactionsGet.data
    // console.log(transactions)


    const rows = transactions.map((element) => (
        <TableTr key={element.id}>
            <TableTd>{element.seller_name}</TableTd>
            <TableTd>{element.buyer_name}</TableTd>
            <TableTd>{element.date}</TableTd>
            <TableTd>{element.reason}</TableTd>
        </TableTr>
    ));

    return (
        <Table>
            <TableThead>
                <TableTr>
                    <TableTh>Seller</TableTh>
                    <TableTh>Buyer</TableTh>
                    <TableTh>Date</TableTh>
                    <TableTh>Reason</TableTh>
                </TableTr>
            </TableThead>
            <TableTbody>{rows}</TableTbody>
        </Table>
    );


};

