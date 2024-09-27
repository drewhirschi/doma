import { Box, Button, Center, Container, Group, Text, TextInput, Textarea, Title } from "@mantine/core";

import { ReportEditor } from "./ReportEditor";
import { redirect } from "next/navigation";
import { serverClient } from '@/shared/supabase-client/server';

export default async function Page({ params }: { params: { reportId: string } }) {



    async function onSubmitTopic(formData: FormData) {
        'use server'

        const searchParams = new URLSearchParams()
        searchParams.set('topic', formData.get('topic') as string)

        redirect('/portal/research/sections?' + searchParams.toString())
    }

    const sb = serverClient()
    const report = await sb.from('reports').select('*').eq('id', params.reportId).single()
    const sections = await sb.from('report_sections').select('*, search_result(*)').eq('report_id', params.reportId).order('id', { ascending: true })

    if (report.error || sections.error) {
        return <div>Error loading data</div>
    }

    return (
        <Box>

            <ReportEditor report={report.data} sections={sections.data ?? []} />
        </Box>
    );
}