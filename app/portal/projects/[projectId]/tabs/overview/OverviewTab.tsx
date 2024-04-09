"use client"

import { Anchor, Avatar, Badge, Box, Button, Combobox, Container, Divider, Group, Input, InputBase, Pagination, Progress, SegmentedControl, Select, Space, Table, Text, TextInput, rem } from "@mantine/core";
import { getCompletedContracts, getInitials, getTotalContracts } from "@/ux/helper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AddContractsModalButton } from "./ImportModal/AddContractsModal";
import { AgreementTypeBadge } from "@/components/AgreementTypeBadge";
import { AssignContractsModalButton } from "./AssignModal";
import FileExplorer from "@/components/TreeFileExplorer/TreeFileExplorer";
import { FilterPopover } from "./Filter";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { PAGE_SIZE } from "../search/shared";
import { ReviewerCombobox } from "@/components/ReviewerCombobox";
import { browserClient } from "@/supabase/BrowerClients";
import { useDebouncedCallback } from 'use-debounce';
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