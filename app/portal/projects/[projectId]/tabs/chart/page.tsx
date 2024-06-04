import { Flex, ScrollArea, Table, TableScrollContainer, TableTbody, TableTh, TableThead, TableTr } from '@mantine/core';

import Chart from './ChartTab';
import { FormatterKeys } from '@/types/enums';
import React from 'react';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params }: { params: { projectId: string } }) {

    const supabase = serverClient()


    const [contractq] = await Promise.all([
        supabase.from("contract").select("*").eq("project_id", params.projectId).limit(100),
        // supabase.from("parslet").select("*, contract_note(content)").order("order", { ascending: true })

    ])
    
    
    if (contractq.error ) {
        console.error(contractq.error)
        throw new Error("Failed to fetch data")
    }
    
    const formattersq = await supabase.from("formatters")
    .select("*, formatted_info(*, annotation(*))")
    // .in("key", [FormatterKeys.agreementInfo, FormatterKeys.license, FormatterKeys.ipOwnership, FormatterKeys.paymentTerms, FormatterKeys.assignability, FormatterKeys.term])
    .in("formatted_info.contract_id", [contractq.data.map((c) => c.id)])
    .order("priority", { ascending: true })


    




    return (
     


        <Chart projectId={params.projectId} contracts={contractq.data ?? []} formatters={formattersq.data ?? []}/>

    );
}