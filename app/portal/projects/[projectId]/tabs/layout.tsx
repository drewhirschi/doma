import { Box, Group, SimpleGrid, Space, Tabs, TabsList, TabsTab, Text, Title, rem } from "@mantine/core";
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

    const supabase = serverClient()
    const { data: project, error } = await supabase.from("project").select("*").eq("id", params.projectId).single()

    if (!project) {
        console.error(error)
        throw new Error("Failed to fetch project")
    }

    const iconStyle = { width: rem(16), height: rem(16) };

    return (
        <Box p="sm">
            <Group mb={"sm"} >

                <div>

                    <BackButton href={"/portal/projects"} />
                    <Title order={1}>{project.display_name}</Title>
                </div>
                <SimpleGrid ml="lg" cols={5} styles={{root: {alignSelf: "flex-end", flex: 1}}}>
                    <div style={{ color: 'GrayText' }}> <Text c="black" fw={600}>Deal Structure</Text> {project.deal_structure}</div>
                    <div style={{ color: 'GrayText' }}><Text c="black" fw={600}>Client</Text> {project.client}</div>
                    <div style={{ color: 'GrayText' }}><Text c="black" fw={600}>Target</Text>{...project.target}</div>
                    <div style={{ color: 'GrayText' }}><Text c="black" fw={600}>Phase Deadline</Text>{project.phase_deadline}</div>
                    <div style={{ color: 'GrayText' }}><Text c="black" fw={600}>Counterparty</Text>{project.counterparty}</div>
                </SimpleGrid>
            </Group>
            <ProjectTabs >
                {children}
            </ProjectTabs>
        </Box>
    );
}