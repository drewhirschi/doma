"use client"

import { ActionIcon, Anchor, Avatar, Badge, Box, Button, Flex, Grid, Group, Menu, RingProgress, Table, Text, rem } from "@mantine/core";
import { IconCheck, IconDotsVertical, IconExclamationCircle, IconPlayerPause, IconPlayerPlay, IconTrash } from "@tabler/icons-react";
import { changeProjectStatus, deleteProject } from "@/components/ProjectCard.actions";

import { AddProjectsModal } from "./AddProjectsModal";
import Link from "next/link";
import { actionWithNotification } from "@/clientComp";
import { getInitials } from "@/ux/helper";
import { notifications } from "@mantine/notifications";
import { title } from "process";

interface Props {
    projects: (Project_SB & { profile: Profile_SB[], contract: { completed: boolean }[] })[]
    users: Profile_SB[]
}


export function ProjectGrid({ projects, users }: Props) {

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
    const rows = projects.map((project) => {

        const completedContracts = project.contract.reduce((count, contract) => {
            return count +
                (contract.completed ? 1 : 0);
        }, 0)

        const totalContracts = project.contract.length
        return (
            <Table.Tr key={project.id}>
                <Table.Td><Group>
                    <Anchor
                        c={"dark"}
                        fw={500}
                        component={Link}
                        href={`projects/${project.id}/tabs/overview`}>{project.display_name}</Anchor>
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
                </Table.Td>
                <Table.Td>
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
                                onClick={async () => {
                                    actionWithNotification(() => deleteProject(project.id), {
                                        title: `Deleting ${project.display_name}`,
                                    })

                                }}
                                leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                                color="red"
                            >
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Table.Td>
                <Table.Td>
                    <Text fz={"sm"} c={"dimmed"} >{new Date(project.phase_deadline).toLocaleDateString()}</Text>
                </Table.Td>
                <Table.Td>
                    <Group>

                        <RingProgress
                            size={40}
                            thickness={6}
                            roundCaps

                            sections={[
                                { value: totalContracts && (completedContracts / totalContracts) * 100, color: 'green' },
                            ]}
                        />
                        <Text size="xs" ta="center" px="xs" style={{ pointerEvents: 'none' }}>
                            {completedContracts}/{totalContracts}
                        </Text>
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Flex>
                        {dispayProfileGroup(project.profile)}
                    </Flex>
                </Table.Td>
            </Table.Tr>
        )
    })

    return (
        <Box >
            <AddProjectsModal
                projects={projects}
                users={users}
            />
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Project</Table.Th>
                        <Table.Th></Table.Th>
                        <Table.Th>Phase deadline</Table.Th>
                        <Table.Th>Progress</Table.Th>
                        <Table.Th>Assigned</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>


        </Box>
    )
}