"use client"

import { Box, Stack, Tabs, TabsList, TabsTab, rem } from '@mantine/core';
import { IconFileSpreadsheet, IconHome, IconSettings } from '@tabler/icons-react';
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
            flex={1}
            value={pathname.split("/").pop() || "overview"}
            onChange={(value) => router.replace(`${value}`)}
        >
            <Stack gap={0} h={"100%"}>

                <TabsList >
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
            </Stack>



        </Tabs>
    )
}