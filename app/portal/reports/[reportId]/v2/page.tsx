import { AppShell, AppShellMain, AppShellNavbar, Box, Button, Container, Divider, Flex, Grid, GridCol, Group, Title } from '@mantine/core';

import { IconPlus } from '@tabler/icons-react';
import { ImageCarousel } from './ImageCarousel';
import React from 'react';
import ReportEditor from './ReportEditor';
import ReportEditorNavbar from './ReportEditorNavbar';
import axios from 'axios';
import { serverClient } from '@/supabase/ServerClients';

const images = [
    {
        url:
            'https://images.unsplash.com/photo-1592323818181-f9b967ff537c',
        alt: 'Best forests to visit in North America',
        category: 'nature',
    },
    {
        url:
            'https://images.unsplash.com/photo-1559494007-9f5847c49d94?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
        alt: 'Hawaii beaches review: better than you think',
        category: 'beach',
    },
]

export default async function Page({ params }: { params: { reportId: string } }) {
    try {


        const sb = serverClient();

        const report = await sb
            .from('reports')
            .select('*, report_sections(*)')
            .eq('id', Number(params.reportId))
            .single();

        if (report.error) {
            return <div>Report not found</div>;
        }

        // const imageQueries = await generateImageQueries(report.data.topic!)
        // const imagesFetch = await axios.get("https://api.pexels.com/v1/search", {
        //     params: {
        //         query: imageQueries[0],
        //     },
        //     headers: {
        //         Authorization: `${process.env.PEXELS_API_KEY}`,
        //     },
        // })

        // console.log(imagesFetch.data)


        return (
            <Group
                mih={"100vh"}
                align='flex-start'
                wrap='nowrap'
            >


                <Box
                    flex={3}
                    mih={"inherit"} bg={"gray.1"} maw={"280px"} p="md"
                >
                    <ReportEditorNavbar />

                </Box>

                <Container flex={9}>

                    {/* <ImageCarousel images={images} /> */}
                    <Title>{report.data.display_name}</Title>
                    <ReportEditor report={report.data} />
                </Container>
            </Group>
        );
    } catch (error) {
        console.log(error)
    }
}