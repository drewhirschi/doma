import { Box, Button, Checkbox, Stack, Text, Title } from '@mantine/core';

import React from 'react';
import { getLLMResponse } from '../helpers';
import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams: { topic: string } }) {

    const queryOptions = {
        user: `I'm creating a market report about "${searchParams.topic}". Give me a list of 12 top-level sections that i could include in the report. List each section on its own line, do not add any formatting or numbering. Don't include subsections.`
    }
    const sectionsRaw = await getLLMResponse(queryOptions)

    const sections = sectionsRaw.text?.split('\n').filter(s => s.trim().length > 0) ?? []

    async function onSubmitQueries(formData: FormData) {
        'use server'
        console.log(formData.toString())
        const redirectSearchParams = new URLSearchParams()

        redirectSearchParams.set('topic', searchParams.topic)
        Array.from(formData)
            
            .filter(([key, value]) => value === 'on')
            .forEach(([key]) => {
                console.log("adding section", key)
                redirectSearchParams.append('sections', key)
            })

        redirect(`search?${redirectSearchParams.toString()}`)
    }

    return (
        <Box>
            <Title mb={"md"}>What sections should be included in the report?</Title>
            <form action={onSubmitQueries}>
                <Stack gap={"xs"}>
                    {sections.map((section: string, i: number) => (
                        <Checkbox
                            defaultChecked
                            label={section}
                            key={section}
                            name={section}
                        />
                    ))}


                </Stack>
                <Button mt={"md"} type='submit'>Submit</Button>
            </form>
        </Box>
    );

}