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
    companyProfile
}: {
    companyProfile: CompanyProfile_SB
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
                  

                    <Box my={"xs"}>

                        <Button disabled={companyProfile == null} onClick={() => {
                            queueFindIndustryCompanies(companyProfile!.id)
                        }}>Find companies</Button>
                        <Button disabled={companyProfile == null} onClick={() => {
                            queueFindIndustyActivity(companyProfile!.id)
                        }}>Find Transactions</Button>
                    </Box>
                </Paper>
              
            </Stack>
            <CompanySummaryEditor companyProfile={companyProfile} />
        </Group>

    );
}