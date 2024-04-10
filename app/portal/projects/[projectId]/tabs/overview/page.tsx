import { Avatar, Box, Button, Container, Grid, Group, Select, SimpleGrid, Space, Table, Tabs, TabsList, TabsPanel, TabsTab, Text, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconChevronLeft, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSettings } from '@tabler/icons-react';
import { RedirectType, redirect, } from 'next/navigation';

import { BackButton } from '@/components/BackButton';
import Link from 'next/link';
import OverviewTab from './OverviewTab';
import { PAGE_SIZE } from '../search/shared';
import { ProjectTabs } from '../ProjectTabs';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params, searchParams }: { params: { projectId: string }, searchParams: { query: string, page: number } }) {

    const query = searchParams?.query || '';
    const page = Number(searchParams?.page)-1 || 0;

    const supabase = serverClient()

    let projectQ = await supabase.from("project")
        .select("*, profile(*)")
        .eq("id", params.projectId)
        .single()

    if (projectQ.error) {
        console.error(projectQ.error)
        throw new Error("Failed to fetch project")
    }

    const project = projectQ.data

    let contractQ
    if (query) {
        contractQ = await supabase.from("contract")
            .select("*", { count: 'estimated' })
            .eq("project_id", params.projectId)
            .ilike('display_name', `%${searchParams.query}%`)
            .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    } else {
        contractQ = await supabase.from("contract")
            .select("*", { count: 'estimated' })
            .eq("project_id", params.projectId)
            .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    }

    if (contractQ.error) {
        console.error(contractQ.error)
        throw new Error("Failed to fetch contracts")
    }


    return (
        // @ts-ignore
        <OverviewTab project={project} contracts={contractQ.data ?? []}  contractCount={contractQ.count!}/>
    );
};

