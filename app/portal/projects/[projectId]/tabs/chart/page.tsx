import { Flex, ScrollArea, Table, TableScrollContainer, TableTbody, TableTh, TableThead, TableTr } from '@mantine/core';

import Chart from './ChartTab';
import { FormatterKeys } from '@/types/enums';
import { PAGE_SIZE } from '../shared';
import React from 'react';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params, searchParams }: { params: { projectId: string }, searchParams: { query: string, page: number } }) {

    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) - 1 || 0;
    const supabase = serverClient()


    let contractQBuilder = supabase.from("contract")
        .select("*", { count: 'estimated' })
        .eq("project_id", params.projectId)
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
        
    if (query) {
        contractQBuilder = contractQBuilder
            .ilike('display_name', `%${searchParams.query}%`)
            // .or().ilike('id', `%${searchParams.query}%`)
    }

    const contractq = await contractQBuilder

    if (contractq.error) {
        console.error(contractq.error)
        throw new Error("Failed to fetch data")
    }

    const projectFormatters = await supabase.from("project")
        .select("formatters(*)")
        .eq("id", params.projectId)
        .single()

    if (projectFormatters.error) {
        console.error(projectFormatters.error)
        throw new Error("Failed to fetch project formatters")
    }

    const formattersq = await supabase.from("formatters")
        .select("*, formatted_info(*, annotation(*))")
        .in("key", projectFormatters.data?.formatters.map((f) => f.key))
        .in("formatted_info.contract_id", [contractq.data.map((c) => c.id)])
        .order("priority", { ascending: true })







    return (



        <Chart projectId={params.projectId} contracts={contractq.data ?? []} formatters={formattersq.data ?? []} contractCount={contractq.count!} />

    );
}