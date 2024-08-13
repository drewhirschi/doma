import { Box, Button, Center, Container, Group, Text, TextInput, Textarea, Title } from "@mantine/core";

import { ReportEditor } from "./ReportEditor";
import { redirect } from "next/navigation";

export default async function Page() {



    async function onSubmitTopic(formData: FormData) {
        'use server'

        const searchParams = new URLSearchParams()
        searchParams.set('topic', formData.get('topic') as string)

        redirect('/portal/research/sections?' + searchParams.toString())
    }




    return (
        <Box>

            <ReportEditor/>
        </Box>
    );
}