"use client"

import { Avatar, Box, Button, Container, Group, Select, Table, Tabs, TabsList, TabsPanel, TabsTab, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconFileArrowLeft, IconFileSpreadsheet, IconHome } from '@tabler/icons-react';

import ChartTab from './ChartTab';
import OverviewTab from './OverviewTab';
import { useRouter } from 'next/navigation';

interface Props {
    activeTab: string
    project: Project_SB & { profile: Profile_SB[], contract: Contract_SB[] }
}

export function ProjectTabs({ activeTab, project }: Props) {

    const router = useRouter()
    const iconStyle = { width: rem(16), height: rem(16) };

    return (
        <Tabs
            value={activeTab}
            onChange={(value) => router.replace(`${value}`)}
        >
            <TabsList mb={"sm"}>
                <TabsTab value="overview" leftSection={<IconHome style={iconStyle} href='tabs/overview' />}>
                    Overview
                </TabsTab>
                <TabsTab value="chart" leftSection={<IconFileSpreadsheet style={iconStyle} href='tabs/chart' />}>
                    Chart
                </TabsTab>
               
            </TabsList>

            {/* <TabsPanel value="overview">
                <OverviewTab
                    project={project}
                />
            </TabsPanel>

            <TabsPanel value="chart">
                <ChartTab projectId={project.id}/>
            </TabsPanel> */}

            
        </Tabs>
    )
}