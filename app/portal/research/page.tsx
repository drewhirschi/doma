import { Box, Button, Center, Container, Group, Text, TextInput, Textarea, Title } from "@mantine/core";

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

            <Title pt={"xl"} order={2}>Research</Title>
            <form action={onSubmitTopic}>

                <Group align="flex-end" >

                    <Textarea
                        label="What topic would you like to research?"
                        autosize
                        name="topic"
                        placeholder="Aerospace"
                    />
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}