"use client"

import { ActionIcon, Avatar, Badge, Button, Card, Container, Flex, Grid, Group, Image, Menu, RingProgress, Text, rem } from "@mantine/core";
import { IconDotsVertical, IconMessages, IconNote, IconPlayerPause, IconPlayerPauseFilled, IconPlayerPlay, IconTrash } from "@tabler/icons-react";
import { changeProjectStatus, deleteProject } from "./ProjectCard.actions";

import Link from "next/link";
import { getInitials } from "@/ux/helper";

interface Props {
    project: Project_SB & { profile: Profile_SB[], contract: { completed: boolean }[] }
}

function dispayProfileGroup(profiles: Profile_SB[]) {
    const displayCount = 4;

    const visibleAvatars = profiles.slice(0, displayCount);
    const remainingCount = Math.max(0, profiles.length - displayCount);

    return (
        <Avatar.Group>
            {visibleAvatars.map((profile, index) => (
                <Avatar
                    key={index}
                    //src={profile.avatar_url} for implenting images
                    alt={profile.display_name ?? profile.email}
                    color={profile.color!}
                    radius="xl"
                >{getInitials(profile.display_name ?? profile.email)}</Avatar>
            ))}
            {remainingCount > 0 && <Avatar key="remaining">+{remainingCount}</Avatar>}
        </Avatar.Group>
    );
}

export default function ProjectCard({ project }: Props) {

    const completedContracts = project.contract.reduce((count, contract) => {
        return count +
            (contract.completed ? 1 : 0);
    }, 0)

    const totalContracts = project.contract.length


    return <Card shadow="sm" padding="lg" radius="md" withBorder w={360}>
        <Card.Section>
            <Image
                src="/images/resized_project_image.jpeg"
                height={160}
                alt="An ai image of a gavil"
            />
        </Card.Section>

        <Group mt={"md"} justify="space-between">

            <div>
                <Group>
                    <Text fw={500}>{project.display_name}</Text>
                    {project.is_active ? (
                        <Badge color="green" variant="filled">
                            Active
                        </Badge>
                    ) : (
                        <Badge color="yellow" variant="filled">
                            Paused
                        </Badge>
                    )}
                </Group>
                <Text fz={"sm"} c={"dimmed"} >Phase Deadline: {new Date(project.phase_deadline).toLocaleDateString()}</Text>
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
                    {project.is_active ? (
                        <Menu.Item
                            onClick={() => changeProjectStatus(project.id, project.is_active)}
                            leftSection={
                                <IconPlayerPause style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                            }
                        >
                            Pause
                        </Menu.Item>
                    ) : (
                        <Menu.Item
                            onClick={() => changeProjectStatus(project.id, project.is_active)}
                            leftSection={
                                <IconPlayerPlay style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                            }
                        >
                            Resume
                        </Menu.Item>
                    )}
                    <Menu.Item
                        onClick={() => deleteProject(project.id)}
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
                {dispayProfileGroup(project.profile)}
            </Flex>
            <RingProgress
                size={80}
                thickness={6}
                roundCaps
                label={<Text size="xs" ta="center" px="xs" style={{ pointerEvents: 'none' }}>
                    {completedContracts}/{totalContracts}
                </Text>}
                sections={[
                    { value: totalContracts && (completedContracts / totalContracts) * 100, color: 'green' },
                ]}
            />
        </Group>

        <Button color="blue" fullWidth mt="md" radius="md" component={Link} href={`projects/${project.id}/tabs/overview`}>
            Continue
        </Button>
    </Card>
}