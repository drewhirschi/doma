"use client";

import { ActionIcon, Anchor, Box, Button, Container, Group, Paper, Stack, TextInput, Title } from "@mantine/core";

import CompanySummaryEditor from "@/ux/components/CompanySummaryEditor";
import Link from "next/link";
import { ProjectWithModelCmp } from "../types";
import React from "react";
import { SetTargetPanel } from "./SetTargetPanel";
import { setModelCompany } from "./actions";

export default function OverviewTab({ project }: { project: ProjectWithModelCmp }) {
  return (
    <Group align="flex-start" m={"sm"} style={{ width: "100%", display: "flex", flexDirection: "row", gap: "sm" }}>
      <CompanySummaryEditor companyProfile={project.model_cmp} />
      <Stack style={{ width: "100%", flex: 1, marginRight: "1.5rem" }}>
        <Paper radius={8} withBorder p={"sm"}>
          <Group mb="sm">
            <Title order={4}>Target Company :</Title>
            {project.model_cmp == null ? (
              <TextInput value="Not set" readOnly />
            ) : (
              <Anchor component={Link} href={`/portal/companies/${project.model_cmp?.id}/overview`} size="xl">
                {project.model_cmp?.name ?? "Not set"}
              </Anchor>
            )}
          </Group>
          <SetTargetPanel setCmpId={(id: number) => setModelCompany(id, project.id)} />
        </Paper>
      </Stack>
    </Group>
  );
}
