"use client";

import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";

import CompanySummaryEditor from "@/ux/components/CompanySummaryEditor";
import Link from "next/link";
import { ProjectWithModelCmp } from "../types";
import React from "react";
import { SetTargetPanel } from "./SetTargetPanel";
import { setModelCompany } from "./actions";

export default function OverviewTab({
  project,
}: {
  project: ProjectWithModelCmp;
}) {
  return (
    <Group align="flex-start" m={"sm"}>
      <Stack>
        <Paper radius={8} withBorder p={"xs"}>
          <Group>
            <Title order={4}>Target</Title>
            <SetTargetPanel
              setCmpId={(id: number) => setModelCompany(id, project.id)}
            />
          </Group>
          {project.model_cmp == null ? (
            "Not set"
          ) : (
            <Anchor
              component={Link}
              href={`/portal/research/companies/${project.model_cmp?.id}/overview`}
            >
              {project.model_cmp?.name ?? "Not set"}
            </Anchor>
          )}
        </Paper>
      </Stack>
      <CompanySummaryEditor companyProfile={project.model_cmp} />
    </Group>
  );
}
