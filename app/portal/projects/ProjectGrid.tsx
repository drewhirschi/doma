"use client"

import { Button, Grid } from "@mantine/core";

import { AddProjectsModal } from "./AddProjectsModel";
import ProjectCard from "@/components/ProjectCard";
import { error } from "console";

interface Props {
    projects: (Project_SB & { profile: Profile_SB[] })[]
    users: Profile_SB[]
}


export function ProjectGrid({ projects, users }: Props) {



    return (
        <div>
            <AddProjectsModal
                projects={projects}
                users={users}
            />
            <Grid>
                {projects.map((project: Project_SB) => (
                    <Grid.Col key={project.id} span={{ base: 12, md: 6, lg: 4 }}>
                        {/* @ts-ignore */}
                        <ProjectCard project={project} />
                    </Grid.Col>
                ))}

            </Grid>
        </div>
    )
}