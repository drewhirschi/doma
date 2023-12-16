"use client"

import { ActionIcon, Avatar, Badge, Button, Card, Container, Flex, Grid, Group, Image, Menu, RingProgress, Text, rem } from "@mantine/core";
import { IconDotsVertical, IconMessages, IconNote, IconPlayerPause, IconPlayerPauseFilled, IconTrash } from "@tabler/icons-react";

import Link from "next/link";
import { browserClient } from "@/supabase/BrowerClients";
import { getInitials } from "@/helper";
import { serverClient } from "@/supabase/ServerClients";

export const teamMembers = [
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png',
        name: 'Robert Wolfkisser',
        job: 'Engineer',
        email: "robert@atlas.com",
        role: 'Admin',
        lastActive: '2 days ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
        name: 'Emily Johnson',
        job: 'Designer',
        email: "emily@atlas.com",
        role: 'User',
        lastActive: '1 day ago',
        active: true,
    },
    {
        avatar: null,
        name: 'Michael Smith',
        job: 'Developer',
        email: "michael@atlas.com",
        role: 'User',
        lastActive: '3 days ago',
        active: false,
    },
];


interface Props {
    project: any
}



export default function ProjectCard({ project }: Props) {




    return <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
            <Image
                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                height={160}
                alt="Norway"
            />
        </Card.Section>

        <Group mt={"md"} justify="space-between">

            <div>

<Group>

                <Text fw={500}>{project.display_name}</Text>
                <Badge color="yellow" variant="filled">Paused</Badge>
</Group>
                <Text fz={"sm"} c={"dimmed"} >Admin: Trevor Brown</Text>
            </div>
            <Menu
                transitionProps={{ transition: 'pop' }}
                withArrow
                position="bottom-end"
                withinPortal
            >
                <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>

                    <Menu.Item
                        leftSection={
                            <IconPlayerPause style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                        }
                    >
                        Pause
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        color="red"
                    >
                        Delete
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>

        <Group justify="space-between" mt="md" mb="xs">

            <Flex>

                {teamMembers.map((avatar, index) => (
                    <Avatar
                        key={index}
                        src={avatar.avatar}
                        alt={avatar.name}
                        radius="xl"
                        style={{
                            marginLeft: index === 0 ? 0 : -10, // Adjust overlap size
                            zIndex: teamMembers.length - index, // Ensures proper stacking
                        }}
                    >{getInitials(avatar.name)}</Avatar>
                ))}
            </Flex>
            <RingProgress
                size={80}
                thickness={6}
                roundCaps
                label={<Text size="xs" ta="center" px="xs" style={{ pointerEvents: 'none' }}>
                    41/100
                </Text>}
                sections={[
                    { value: 40, color: 'green' },
                ]}
            />
        </Group>

        <Button color="blue" fullWidth mt="md" radius="md" component={Link} href={`projects/${project.id}`}>
            Continue
        </Button>
    </Card>
}