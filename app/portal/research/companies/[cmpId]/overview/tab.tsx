"use client"

import { ActionIcon, Box, Button, Container, Group, Paper, Stack, TextInput } from '@mantine/core';
import { queueFindIndustryCompanies, queueFindIndustyActivity } from './actions';

import CompanySummaryEditor from '@/ux/components/CompanySummaryEditor';
import Image from 'next/image';
import type { Tables } from '@/types/supabase-generated';

export default function OverviewTab({
    companyProfile,
    logos
}: {
    companyProfile: CompanyProfile_SB
    logos: Tables<'cmp_logos'>[]
}) {




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
                <Paper
                    bg={"gray.9"}
                    radius={8}
                    withBorder
                    p={"xs"}
                >
                    {logos.map(l => <img key={l.url} alt={l.alt ?? ""} src={l.url} height={100} />)}

                </Paper>

            </Stack>
            <CompanySummaryEditor companyProfile={companyProfile} />
        </Group>

    );
}