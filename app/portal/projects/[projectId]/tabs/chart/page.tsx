import { Flex, ScrollArea, Table, TableScrollContainer, TableTbody, TableTh, TableThead, TableTr } from '@mantine/core';

import Chart from './ChartTab';
import React from 'react';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params }: { params: { projectId: string } }) {

    const supabase = serverClient()


    const [projectQ, parsletQ] = await Promise.all([
        supabase.from("project").select("*, contract(*, contract_note(*, parslet(order)))").eq("id", params.projectId).single(),
        supabase.from("parslet").select("*, contract_note(content)").order("order", { ascending: true })
    ])
    
    
    if (!projectQ.data || !parsletQ.data) {
        console.error(projectQ.error, parsletQ.error)
        throw new Error("Failed to fetch data")
    }
    
    const formattersq = await supabase.from("formatters")
    .select("*, formatted_info(*)")
    .in("formatted_info.contract_id", [projectQ.data.contract.map((c) => c.id)])
    .order("priority", { ascending: true })

    const parslets = parsletQ.data ?? []

    // projectQ.data.contract.forEach(contract => {
    //     contract.contract_note.sort((a, b) => (a.parslet?.order ?? 0) - (b.parslet?.order ?? 0))
    // })




    return (
     


        <Chart projectId={params.projectId} parslets={parslets} contracts={projectQ.data?.contract ?? []} formatters={formattersq.data ?? []}/>

    );
}