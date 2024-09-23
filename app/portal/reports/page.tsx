import { Box, Container, Divider, Group, Title } from '@mantine/core';
import { serverActionClient, serverClient } from '@/shared/supabase-client/ServerClients';

import { NewReportButton } from './NewReportButton';
import { NewTemplateButton } from './NewTemplate';
import React from 'react';
import ReportsTable from './ReportsTable';
import axios from 'axios';
import { revalidatePath } from 'next/cache';

// import { generateImageQueries } from '../research/helpers';


interface IpageProps { }

export default async function page() {

    const onCreateReport = async (title: string, industry: string, templateId?: number) => {
        "use server"
        const sb = serverActionClient()


        // const imageQueries = await generateImageQueries(industry)

        const insert = await sb.from('reports')
            .insert({
                display_name: title,
                topic: industry,
                slug: title.replaceAll(' ', '-'),
                // image_queries: imageQueries
            }).select().single()



        if (templateId && !insert.error) {
            const sections = await sb.from('report_template_sections').select("title, instruction")

            const sectionsWithReportId = sections.data?.map(s => ({ report_id: insert.data.id, ...s })) ?? []
            const templateInsert = await sb.from('report_sections')
                .insert(sectionsWithReportId)

            if (templateInsert.error) {
                console.log(templateInsert.error)
            }
        }
        revalidatePath(`/portal/reports`)
    }

    const sb = serverClient()
    const reports = await sb.from('reports').select()
    const templates = await sb.from('report_templates').select()

    return (
        <Box>
            <Container mt={120}>
                <Title>Decks</Title>
                <Divider mb={"sm"} />
                <Group justify='flex-end'>
                    <NewReportButton onCreateReport={onCreateReport} templates={templates.data ?? []} />
                </Group>
                <ReportsTable reports={reports.data ?? []} />
                <Title>Slide templates</Title>
                <Divider mb={"sm"} />
                <Group justify='flex-end'>
                    <NewTemplateButton onCreateReport={onCreateReport} templates={templates.data ?? []} />
                </Group>
            </Container>
        </Box>
    );
}


