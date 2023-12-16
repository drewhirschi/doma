"use client"

import { Anchor, AppShell, Breadcrumbs, Code, Group, NavLink, ScrollArea, Space, Stack, Text, UnstyledButton } from '@mantine/core';

import { Icon24Hours } from '@tabler/icons-react';
// import Banner from '../banner';
// import Crumbs from './Crumbs';
import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@/components/UserButton';
import { usePathname } from 'next/navigation'

export default function Home({ children, params }: {
    children: React.ReactNode
    params: { team: string }
}) {

    const pathname = usePathname()
    const base = `/portal`

    const collapsed = true



    return (
        <AppShell
            header={{ height: 50 }}
            navbar={{
                width: { base: 260 },
                breakpoint: 'xs',
                collapsed: { mobile: true, desktop: false },
            }} padding="md"
            layout='alt'
        >
            <AppShell.Navbar p="md">
                <Space h="xl" />
                <Space h="xl" />
                <Stack justify='space-between' h={"100%"}>

                    <div>
                        <NavLink
                            href={base + `/projects`}
                            label={

                                <Text>Projects</Text>
                            }
                            component={Link}
                            active={pathname.split("/")[2] === "projects"}
                        />
                        <NavLink
                            href={base + `/team`}
                            label={
                                <Text>Team</Text>
                            }
                            component={Link}
                            active={pathname.split("/")[2] === "team"}
                        />
                        <NavLink
                            href={base + `/config`}
                            label={
                                <Text>AI Config</Text>
                            }
                            component={Link}
                            active={pathname.split("/")[2] === "config"}
                        />
                    </div>



                    <UserButton collapsed={false} />
                </Stack>
            </AppShell.Navbar>
            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>






    )
}
