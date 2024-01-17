"use client"

import { Anchor, AppShell, Box, Breadcrumbs, Code, Flex, Group, NavLink, ScrollArea, Space, Stack, Text, UnstyledButton } from '@mantine/core';
import { Icon24Hours, IconFolderOpen, IconUsersGroup } from '@tabler/icons-react';

import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@/components/UserButton';
import classnames from "./layout.module.css"
import { useHover } from '@mantine/hooks';
import { usePathname } from 'next/navigation'

export default function Home({ children, params }: {
    children: React.ReactNode
    params: { team: string }
}) {

    const pathname = usePathname()
    const { hovered: navbarHovered, ref: navbarRef } = useHover();
    const base = `/portal`



    return (
        <Flex
        w={"100%"}
            direction={"row"}
            wrap={"nowrap"}
        >
            <Box
                ref={navbarRef}
                className={classnames.navbar}
            >
                
                <Stack justify='space-between' h={"100%"}>

                    <div>
                        <NavLink
                            href={base + `/projects`}
                            leftSection={<IconFolderOpen />}
                            label={navbarHovered ? <Text>Projects</Text> : null}
                            component={Link}
                            active={pathname.split("/")[2] === "projects"}
                        />
                        <NavLink
                            href={base + `/team`}
                            leftSection={navbarHovered && <IconUsersGroup />}
                            label={navbarHovered ? <Text>Team</Text> : <IconUsersGroup />}
                            component={Link}
                            active={pathname.split("/")[2] === "team"}
                        />

                    </div>

                    <UserButton collapsed={!navbarHovered} />
                </Stack>
            </Box>
            <Box 
             className={classnames.content}
            >
                {children}
            </Box>
        </Flex>

    )
}
