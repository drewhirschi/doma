"use client"

import { Button, Group } from "@mantine/core";
import { convertWordFiles, linifyContracts, queueProject } from "./actions";

import EditFormattersPanel from "./EditFormattersPanel";
import { useState } from "react";

type ActionStatus = "idle" | "inprogress" | "failed"
export function ProjectActionButtons({ projectId }: { projectId: string }) {

    const [parseStatus, setParseStatus] = useState<ActionStatus>("idle")

    return (
        <Group>

            <Button onClick={() => queueProject(projectId)} >Queue contracts</Button>
            <Button onClick={() => convertWordFiles(projectId)} >Convert Word Files to PDFs</Button>
            <Button
                loading={parseStatus == "inprogress"}
                onClick={() => {
                    setParseStatus("inprogress")
                    linifyContracts(projectId)
                        .then(() => setParseStatus("idle"))
                        .catch(() => setParseStatus("failed"))
                }}>Parse contracts text</Button>
                <EditFormattersPanel projectId={projectId} />
        </Group>
    )
}