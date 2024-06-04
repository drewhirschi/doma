"use client"

import { Box, Stack, Tabs, TabsList, TabsTab, rem } from '@mantine/core';
import { IconFileSpreadsheet, IconFlag, IconHome, IconSearch, IconSettings } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {

    children: React.ReactNode
}

export function ProjectTabs({ children }: Props) {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams();
    const iconStyle = { width: rem(16), height: rem(16) };

    return (
        <Tabs
            flex={1}
            value={pathname.split("/").pop() || "overview"}
            onChange={(value) => {
                let newUrl = `${value}`
                if (searchParams) {
                    newUrl += `?${searchParams.toString()}`
                }
                router.replace(newUrl)
            }}
        >
            <Stack gap={0} h={"100%"}>

                <TabsList miw={860}>
                    <TabsTab value="overview" leftSection={<IconHome style={iconStyle} />}>
                        Overview
                    </TabsTab>
                    <TabsTab value="search" leftSection={<IconSearch style={iconStyle} />}>
                        Search
                    </TabsTab>
                    <TabsTab value="chart" leftSection={<IconFileSpreadsheet style={iconStyle} />}>
                        Chart
                    </TabsTab>
                    <TabsTab value="reports" leftSection={<IconFlag style={iconStyle} />}>
                        Reports
                    </TabsTab>
                    <TabsTab value="settings" leftSection={<IconSettings style={iconStyle} />}>
                        Settings
                    </TabsTab>

                </TabsList>

                {children}
            </Stack>



        </Tabs>
    )
}