"use client"

import { ActionIcon, Box, Button, Container, Group, Paper, Stack, TextInput } from '@mantine/core';
import { BubbleMenu, EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import { queueCompanyProfiling, queueFindIndustryCompanies, queueFindIndustyActivity, setModelCompany } from './actions';

import CompanySummaryEditor from '@/ux/components/CompanySummaryEditor';
import MetadataItem from '@/ux/components/MetadataItem';
import { ProjectWithModelCmp } from '../types';
import React from 'react';
import { SetTargetPanel } from './SetTargetPanel';
import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { useDebouncedCallback } from 'use-debounce';
import { useForm } from '@mantine/form';

export default function OverviewTab({
    project
}: {
    project: ProjectWithModelCmp
}) {

    const form = useForm({
        initialValues: {
            url: "",
        }
    })


    return (
        <Group align='flex-start' m={"sm"}>
            <Stack>

                <Paper
                    radius={8}
                    withBorder
                    p={"xs"}
                >
                    <Group>
                        {project.model_cmp ? <MetadataItem header={"Model Company"} text={project.model_cmp?.name ?? "Not set"} />

                            : <SetTargetPanel setCmpId={(id: number) => setModelCompany(id, project.id)} />
                        }

                    </Group>

                    <Box my={"xs"}>

                        <Button disabled={project.model_cmp == null} onClick={() => {
                            queueFindIndustryCompanies(project.model_cmp!.id)
                        }}>Find companies</Button>
                        <Button disabled={project.model_cmp == null} onClick={() => {
                            queueFindIndustyActivity(project.model_cmp!.id)
                        }}>Find Transactions</Button>
                    </Box>
                </Paper>
                <Paper
                    radius={8}
                    withBorder
                    p={"xs"}
                >

                    <Box maw={600}>
                        <Group w={600} align='flex-end' justify='space-between'>

                            <TextInput
                                flex={1}
                                label="Profile a company"
                                placeholder="Enter a url"
                                {...form.getInputProps('url')}
                            />
                            <Button onClick={async () => {
                                try {

                                    await queueCompanyProfiling(form.values.url)
                                    form.reset()
                                } catch (error) {

                                }
                            }}>Profile</Button>
                        </Group>
                    </Box>
                </Paper>
            </Stack>
            <CompanySummaryEditor companyProfile={project.model_cmp} />
        </Group>

    );
}