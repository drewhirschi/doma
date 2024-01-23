"use client"

import { Avatar, Box, Button, Container, Group, Select, Table, Tabs, TabsList, TabsPanel, TabsTab, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconFileArrowLeft, IconHome } from '@tabler/icons-react';

import OverviewTab from './OverviewTab';
import { useRouter } from 'next/navigation';

interface Props {
    activeTab: string
    project: Project_SB & { profile: Profile_SB[], contract: Contract_SB[] }
}

export function ProjectTabs({ activeTab, project }: Props) {

    const router = useRouter()
    const iconStyle = { width: rem(12), height: rem(12) };

    return (
        <Tabs
            value={activeTab}
            onChange={(value) => router.replace(`${value}`)}
        >
            <TabsList mb={"sm"}>
                <TabsTab value="overview" leftSection={<IconHome style={iconStyle} href='tabs/overview' />}>
                    Overview
                </TabsTab>
                <TabsTab value="messages" leftSection={<IconAlertCircle style={iconStyle} href='tabs/messages' />}>
                    Red Flags
                </TabsTab>
                <TabsTab value="settings" leftSection={<IconFileArrowLeft style={iconStyle} />}>
                    Supplemental Requests
                </TabsTab>
            </TabsList>

            <TabsPanel value="overview">
                <OverviewTab
                    project={project}
                />
            </TabsPanel>

            <TabsPanel value="messages">
                Highlevel overview of the important information found in the contracts
            </TabsPanel>

            <TabsPanel value="settings">
                Supplemental Requests - sending, recieving
            </TabsPanel>
        </Tabs>
    )
}