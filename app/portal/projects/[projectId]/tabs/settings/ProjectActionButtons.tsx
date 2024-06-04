"use client"

import { Button, Group } from "@mantine/core";
import { convertWordFiles, queueProject } from "./actions";

export function ProjectActionButtons({ projectId }: { projectId: string }) {

    return (
        <Group>

            <Button onClick={() => queueProject(projectId)} >Queue contracts</Button>
            <Button onClick={() => convertWordFiles(projectId)} >Convert Word Files to PDFs</Button>
        </Group>
    )
}