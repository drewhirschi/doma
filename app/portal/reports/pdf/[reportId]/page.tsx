import { ActionIcon, Button, Container, Divider, Group, Textarea, Title, rem } from '@mantine/core';
import React, { useState } from 'react';

import EmailBuilder from './EmailBuilder';
import { IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import { ViewershipStats } from './ViewershipStats';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params }: { params: { reportId: string } }) {



    try {


        const sb = serverClient();

        const report = await sb
            .from('reports')
            .select('*, report_views(*)')
            .eq('id', Number(params.reportId))
            .single();

        if (report.error) {
            return <div>Report not found</div>;
        }




        return (
            <Container>

                {/* <ImageCarousel images={images} /> */}
                <Group justify='space-between'>

                    <Title>{report.data.display_name}</Title>
                    <ActionIcon
                        size={42}
                        variant="default"
                        aria-label="ActionIcon with size as a number"
                        href={`/reports/${params.reportId}`}
                        target='_blank'
                        component={Link}
                    >
                        <IconExternalLink style={{ width: rem(24), height: rem(24) }}
                        />
                    </ActionIcon>
                </Group>

               <EmailBuilder/>
               <Title order={2}>Stats</Title>
               <ViewershipStats views={report.data.report_views ?? []}/>
            </Container>
        );
    } catch (error) {
        console.log(error)
    }
}