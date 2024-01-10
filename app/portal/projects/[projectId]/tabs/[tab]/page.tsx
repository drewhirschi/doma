import { Avatar, Box, Button, Container, Group, Select, Table, Tabs, TabsList, TabsPanel, TabsTab, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconChevronLeft, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSettings } from '@tabler/icons-react';
import { RedirectType, redirect, } from 'next/navigation';

import { BackButton } from '@/components/BackButton';
import Link from 'next/link';
import OverviewTab from './OverviewTab';
import { ProjectTabs } from './ProjectTabs';
import { getUserTenant } from '@/shared/getUserTenant';
// import { OverviewTab } from './OverviewTab';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params, searchParams }: { params: { projectId: string, tab: string }, searchParams: { query: string } }) {


    const query = searchParams?.query || '';

    const supabase = serverClient()

    let projectQ
    if (query) {
        projectQ = await supabase.from("project").select("*, profile(*), contract(*)").eq("id", params.projectId)
        .ilike('contract.display_name', `%${searchParams.query}%`)
        .single()
    } else {
        projectQ = await supabase.from("project").select("*, profile(*), contract(*)").eq("id", params.projectId).single()
    }

    if (!projectQ.data) {
        console.error(projectQ.error)
        throw new Error("Failed to fetch project")
    }

    const project = projectQ.data

    const tenantId = getUserTenant(supabase)

    if (!tenantId) {
        throw new Error("No tenant id")
    }


    return (
        <Box p="sm">
            <BackButton href={"/portal/projects"} />
            <Title mb={"sm"} order={1}>{project.display_name}</Title>
            <ProjectTabs activeTab={params.tab} project={project}/>
        </Box>

    );
};

