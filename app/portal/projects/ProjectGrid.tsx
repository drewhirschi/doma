"use client"

import { Grid } from "@mantine/core";
import ProjectCard from "@/components/ProjectCard";
import { error } from "console";

interface Props {
    fetchRes: any
}
export function ProjectGrid({ fetchRes }: Props) {


    if (fetchRes.error) {
        return <div>There was an error loading the projects</div>
    }

    return (
        <Grid>
            {fetchRes.data.map((project: any) => (
                <Grid.Col key={project.id} span={{ base: 12, md: 6, lg: 4 }}> <ProjectCard project={project} /> </Grid.Col>
            ))}

        </Grid>
    )
}