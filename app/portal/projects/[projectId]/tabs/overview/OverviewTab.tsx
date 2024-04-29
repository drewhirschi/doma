"use client"

import { Box, } from "@mantine/core";
import FileExplorer from "@/components/TreeFileExplorer/TreeFileExplorer";
import { useState } from "react";

interface Props {
    project: Project_SB & { profile: Profile_SB[] }
    contracts: Contract_SB[]
    contractCount: number
}

export default function OverviewTab({ project, contracts, contractCount }: Props) {
    const projectId = project.id
    const members = project.profile

    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    return (
        <Box miw={860} p={"lg"}>

                    <FileExplorer
                        members={members}
                        project={project}
                        root={`projects/${projectId}`}
                        tenantId={project.tenant_id}
                        setSelectedRows={setSelectedRows}
                        selectedRows={selectedRows}

                    />
                   
        </Box>
    )
}