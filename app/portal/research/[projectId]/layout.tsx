import { Box, Flex, Group, SimpleGrid, Space, Stack, Tabs, TabsList, TabsTab, Text, Title, rem } from "@mantine/core";
import { IconFileSpreadsheet, IconHome } from "@tabler/icons-react";

import { BackButton } from "@/components/BackButton";
import { ProjectTabs } from "./ProjectTabs";
import { serverClient } from "@/supabase/ServerClients";

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { projectId: string }
}) {

    const project = await serverClient().from("ib_projects").select("*").eq("id", params.projectId).single();
 

    return (
        <Stack h={"100vh"} gap={0} w="calc(100vw - 60px)" >
            <Group p="sm" mb={"sm"} miw={860}>

                {/* <div> */}

                    <BackButton href={"/portal/research"} />
                    <Title order={1}>{project.data?.title}</Title>
                {/* </div> */}
                
            </Group>
            <ProjectTabs >
                {children}
            </ProjectTabs>
        </Stack>
    );
}