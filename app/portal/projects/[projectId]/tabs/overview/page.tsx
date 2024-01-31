import { Avatar, Box, Button, Container, Grid, Group, Select, SimpleGrid, Space, Table, Tabs, TabsList, TabsPanel, TabsTab, Text, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconChevronLeft, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSettings } from '@tabler/icons-react';
import { RedirectType, redirect, } from 'next/navigation';

import { BackButton } from '@/components/BackButton';
import Link from 'next/link';
import OverviewTab from './OverviewTab';
import { ProjectTabs } from '../ProjectTabs';
import { getUserTenant } from '@/shared/getUserTenant';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params, searchParams }: { params: { projectId: string}, searchParams: { query: string } }) {

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

    const tenantId = await getUserTenant(supabase)

    if (!tenantId) {
        throw new Error("No tenant id")
    }

    const assignedContracts = project.contract.reduce((count, contract) => {
        return count +
            (contract.assigned_to === null ? 0 : 1);
    }, 0)

    // await new Promise((resolve) => setTimeout(resolve, 5_000));

    return (
       <OverviewTab project={project} />
    );
};

