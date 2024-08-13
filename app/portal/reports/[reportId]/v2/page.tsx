import { Button, Container, Divider, Title } from '@mantine/core';

import { IconPlus } from '@tabler/icons-react';
import { ImageCarousel } from './ImageCarousel';
import React from 'react';
import ReportEditor from './ReportEditor';
import axios from 'axios';
import { generateImageQueries } from '../../../research/helpers';
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
            <Container>

                {/* <ImageCarousel images={images} /> */}
                <Title>{report.data.display_name}</Title>
                <ReportEditor report={report.data}/>
                
            </Container>
        );
    } catch (error) {
        console.log(error)
    }
}