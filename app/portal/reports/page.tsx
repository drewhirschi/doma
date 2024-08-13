import { Box, Container, Group } from '@mantine/core';
import { serverActionClient, serverClient } from '@/supabase/ServerClients';

import { NewReportButton } from './NewReportButton';
import React from 'react';
import ReportsTable from './ReportsTable';
import axios from 'axios';
import { revalidatePath } from 'next/cache';

// import { generateImageQueries } from '../research/helpers';


interface IpageProps { }

export default async function page() {

    const onCreateReport = async (title: string, industry: string) => {
        "use server"
        const sb = serverActionClient()

        // const imageQueries = await generateImageQueries(industry)

        const insert = await sb.from('reports')
            .insert({ 
                display_name: title, 
                topic: industry, 
                slug: title.replaceAll(' ', '-'),
                // image_queries: imageQueries
             })
        revalidatePath(`/portal/reports`)
    }

    const sb = serverClient()
    const reports = await sb.from('reports').select()

    return (
        <Box>
            <Container mt={120}>

                <Group justify='flex-end'>
                    <NewReportButton onCreateReport={onCreateReport} />
                </Group>
                <ReportsTable reports={reports.data ?? []} />
            </Container>
        </Box>
    );
}


