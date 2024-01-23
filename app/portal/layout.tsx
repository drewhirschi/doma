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
            h={"100vh"}
        >


            <Stack
                ref={navbarRef}
                className={classnames.navbar}>

                <div className={classnames["nav-item"]}>
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

                <div className={classnames["nav-item"]}>

                    <UserButton collapsed={!navbarHovered} />
                </div>
            </Stack>

            <ScrollArea h={"100%"} className={classnames.content}>

                {children}
            </ScrollArea>



        </Flex>

    )
}
