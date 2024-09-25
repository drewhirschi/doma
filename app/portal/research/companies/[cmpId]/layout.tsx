import { ActionIcon, Box, Flex, Group, SimpleGrid, Space, Stack, Tabs, TabsList, TabsTab, Text, Title, rem } from "@mantine/core";
import { IconExternalLink, IconFileSpreadsheet, IconHome } from "@tabler/icons-react";

import { BackButton } from "@/ux/components/BackButton";
import Link from "next/link";
import { ProjectTabs } from "./ProjectTabs";
import { serverClient } from "@/shared/supabase-client/ServerClients";

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { cmpId: string }
}) {

    const companyGet = await serverClient().from("company_profile").select("*").eq("id", params.cmpId).single();

    if (companyGet.error) {
        console.log(companyGet.error)
        return <Title>Not found</Title>
    }

    return (
        <Stack h={"100vh"} gap={0} w="calc(100vw - 60px)" >
            <Group p="sm" mb={"sm"} miw={860}>

                {/* <div> */}

                <BackButton href={"/portal/research"} />
                <Title order={1}>{companyGet.data?.name}</Title>
                {/* </div> */}

                {
                    companyGet.data.origin &&
                    <ActionIcon
                        variant="transparent"
                        component={Link}
                        href={companyGet.data?.origin}
                        target="_blank"
                    >
                        <IconExternalLink />
                    </ActionIcon>
                }

            </Group>
            <ProjectTabs >
                {children}
            </ProjectTabs>
        </Stack>
    );
}