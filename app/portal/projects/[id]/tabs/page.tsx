import { Avatar, Box, Button, Container, Group, Select, Table, Tabs, TabsList, TabsPanel, TabsTab, Title, rem } from '@mantine/core';
import { IconAlertCircle, IconChevronLeft, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSettings } from '@tabler/icons-react';

import { BackButton } from '@/components/BackButton';
import Link from 'next/link';
import OverviewTab from './OverviewTab';
// import { OverviewTab } from './OverviewTab';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params }: { params: { id: string } }) {

    const supabase = serverClient()
    const { data: project, error } = await supabase.from("project").select("*, profile(*)").eq("id", params.id).single()
    const contractsRes = await supabase.from("contract").select("*").eq("project_id", params.id)






    const iconStyle = { width: rem(12), height: rem(12) };

    return (
        <Box p="sm">
           <BackButton href={"/portal/projects"}/>
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
                    <OverviewTab 
                    projectId={project.id}
                     contracts={contractsRes.data!}
                     members={project.profile}
                     
                     />
                </TabsPanel>

                <TabsPanel value="messages">
                    Messages tab content
                </TabsPanel>

                <TabsPanel value="settings">
                    Settings tab content
                </TabsPanel>
            </Tabs>
        </Box>

    );
};

