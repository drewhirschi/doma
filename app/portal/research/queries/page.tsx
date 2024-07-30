import { Box, Button, Checkbox, Container, Stack, Title } from '@mantine/core';

import React from 'react';
import { generateSearchQueries } from '../helpers';
import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams: { topic: string } }) {


    async function onSubmitQueries(formData: FormData) {
        'use server'


        const checkedQueries = Array.from(formData).filter(([key, value]) => value === 'on').map(([key]) => `&queries=${key}`);
        redirect(`search?topic=${searchParams.topic}${checkedQueries.join('')}`)
    }

    const queries = await generateSearchQueries(searchParams.topic, 2);

    return (
        <Box >

                <Title mb={"md"} pt={"xl"} order={2}>{searchParams.topic}</Title>

                <form action={onSubmitQueries}>
                    <Stack gap={"xs"}>

                        {queries.map((q, i) => <Checkbox
                            defaultChecked
                            label={q}
                            key={q}
                            name={q}
                        />)}
                    </Stack>
                    <Button mt={"md"} type='submit'>Submit</Button>
                </form>
        </Box>
    );
}