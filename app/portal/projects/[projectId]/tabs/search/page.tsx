import { Anchor, Avatar, Box, Button, Container, Grid, Group, Pagination, Select, SimpleGrid, Space, Table, Tabs, TabsList, TabsPanel, TabsTab, Text, TextInput, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconChevronLeft, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSearch, IconSettings } from '@tabler/icons-react';
import { RedirectType, redirect, useRouter, } from 'next/navigation';

import { BackButton } from '@/components/BackButton';
import { FilterPopover } from '../overview/Filter';
import Link from 'next/link';
import { PAGE_SIZE } from '../shared';
import { ProjectTabs } from '../ProjectTabs';
import { SearchTab } from './SearchTab';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';
import { useDebouncedCallback } from 'use-debounce';

export default async function Page({ params, searchParams }: { params: { projectId: string }, searchParams: { query: string, page: number } }) {

    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) - 1 || 0;

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

    let contractQBuilder = supabase.from("contract")
        .select("*", { count: 'estimated' })
        .eq("project_id", params.projectId)
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
        
    if (query) {
        contractQBuilder = contractQBuilder
            .ilike('display_name', `%${searchParams.query}%`)
    }

    const contractQ = await contractQBuilder

    if (contractQ.error) {
        console.error(contractQ.error)
        throw new Error("Failed to fetch contracts")
    }

    return <SearchTab project={project} contracts={contractQ.data} contractCount={contractQ.count ?? 0} />


};

