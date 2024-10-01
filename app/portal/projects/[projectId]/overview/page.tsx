import { Box, Button } from "@mantine/core";

import MetadataItem from "@/ux/components/MetadataItem";
import { ProjectWithModelCmp } from "../types";
import { Queue } from "bullmq";
import React from "react";
import Tab from "./tab";
import { serverClient } from "@/shared/supabase-client/server";

export default async function Page({
  params,
}: {
  params: { projectId: string };
}) {
  const sb = serverClient();

  const project = await sb
    .from("ib_projects")
    .select("*, model_cmp(*)")
    .eq("id", params.projectId)
    .single<ProjectWithModelCmp>();

  return (
    <Box bg={"gray.1"} h={"100%"} w={"100%"}>
      <Tab project={project.data!} />
    </Box>
  );
}
