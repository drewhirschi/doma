"use client"

import {IconFileSpreadsheet, IconHome, IconSettings} from '@tabler/icons-react';
import { Tabs, TabsList, TabsTab, rem } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
   
    children: React.ReactNode
}

export function ProjectTabs({ children }: Props) {

    const router = useRouter()
    const pathname = usePathname()
    const iconStyle = { width: rem(16), height: rem(16) };

    return (
        <Tabs
            value={pathname.split("/").pop() || "overview"}
            onChange={(value) => router.replace(`${value}`)}
        >
            <TabsList mb={"sm"}>
                <TabsTab value="overview" leftSection={<IconHome style={iconStyle} href='tabs/overview' />}>
                    Overview
                </TabsTab>
                <TabsTab value="chart" leftSection={<IconFileSpreadsheet style={iconStyle} href='tabs/chart' />}>
                    Chart
                </TabsTab>
                <TabsTab value="settings" leftSection={<IconSettings style={iconStyle} href='tabs/settings' />}>
                    Settings
                </TabsTab>

            </TabsList>

            {children}
           


        </Tabs>
    )
}