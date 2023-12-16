import { Avatar, Button, Container, Group, Select, Table, Tabs, TabsList, TabsPanel, TabsTab, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconChevronLeft, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSettings } from '@tabler/icons-react';

import Link from 'next/link';
import OverviewTab from './OverviewTab';
// import { OverviewTab } from './OverviewTab';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params, children }: { params: { id: string }, children: JSX.Element }) {

    const supabase = serverClient()
    const { data: project, error } = await supabase.from("project").select("*").eq("id", params.id).single()







    const iconStyle = { width: rem(12), height: rem(12) };

    return (
        <>
            <Button href={"/portal/projects"} leftSection={<IconChevronLeft size={14} />} variant="transparent" component={Link}>
                Back
            </Button>
            <Title mb={"sm"} order={1}>{project.display_name}</Title>
            <Tabs defaultValue="overview">
                <TabsList mb={"sm"}>
                    <TabsTab value="overview" leftSection={<IconHome style={iconStyle} />}>
                        Overview
                    </TabsTab>
                    <TabsTab value="messages" leftSection={<IconAlertCircle style={iconStyle}/>}>
                        Red Flags
                    </TabsTab>
                    <TabsTab value="settings" leftSection={<IconFileArrowLeft style={iconStyle} />}>
                        Supplemental Requests
                    </TabsTab>
                </TabsList>

                <TabsPanel value="overview">
                    <OverviewTab projectId={project.id}/>
                </TabsPanel>

                <TabsPanel value="messages">
                    Messages tab content
                </TabsPanel>

                <TabsPanel value="settings">
                    Settings tab content
                </TabsPanel>
            </Tabs>
        </>

    );
};

