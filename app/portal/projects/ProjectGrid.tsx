"use client"

import { Grid, Button } from "@mantine/core";
import ProjectCard from "@/components/ProjectCard";
import { error } from "console";
import { AddProjectsModal } from "./AddProjectsModel";

interface Props {
    projectFetch: any
    userFetch: any
}

export function ProjectGrid({ projectFetch, userFetch }: Props) {


    if (projectFetch.error) {
        return <div>There was an error loading the projects</div>
    }

    return (
        <div>
            <AddProjectsModal
                 projectFetch={projectFetch}
                 userFetch={userFetch}
            />
            <Grid>
                {projectFetch.data.map((project: any) => (
                    <Grid.Col key={project.id} span={{ base: 12, md: 6, lg: 4 }}> <ProjectCard project={project} /> </Grid.Col>
                ))}

            </Grid>
        </div>
    )
}