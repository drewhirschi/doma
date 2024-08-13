import { Anchor, Box, Button, Card, CardSection, Checkbox, Container, Group, Image, Stack, Text, Title } from '@mantine/core';
import { ContentsOptions, SearchResult } from 'exa-js';

import { Suspense } from 'react';

interface ISearchResultPreviewProps {
    // query: string;
    searchResult: SearchResult<ContentsOptions>;
    summary: string;
}

export function SearchResultPreview(props: ISearchResultPreviewProps) {

    // console.log(props.searchResult)
    const domain = new URL(props.searchResult.url).hostname
    // const preview = await getLinkPreview(props.searchResult.url)
    // const summary = await getLLMResponse({ user: "summarize the following article in 2-3 sentences: " + props.searchResult.text})


    


    return (
        <Box >
            <Suspense fallback={<div>Loading...</div>}>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    {/* <CardSection>
                        <Image
                            src={preview.images[0] ? preview.images[0] : preview.favicons[0]}
                            height={160}
                            alt={preview.description}
                        />
                    </CardSection> */}

                    <Group justify="space-between" mt="md" mb="xs">
                        <Anchor href={props.searchResult.url} target="_blank" fw={500} c="black">

                            {props.searchResult.title}
                        </Anchor>
                    </Group>

                    <Text size="sm" c="dimmed">
                        {/* {summary} */}
                        {domain} | {props.searchResult.publishedDate} 
                    </Text>


                </Card>
            </Suspense>
        </Box>
    );


}