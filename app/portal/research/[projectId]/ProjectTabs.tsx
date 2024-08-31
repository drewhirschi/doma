"use client"

import { Box, Stack, Tabs, TabsList, TabsTab, rem } from '@mantine/core';
import { IconFileSpreadsheet, IconFlag, IconHome, IconSearch, IconSettings, IconSwitchHorizontal } from '@tabler/icons-react';
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
                    <TabsTab value="activity" leftSection={<IconSwitchHorizontal style={iconStyle} />}>
                        M&A Activity
                    </TabsTab>
                </TabsList>

                {children}
            </Stack>



        </Tabs>
    )
}