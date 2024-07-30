import { Box, Button, Card, CardSection, Checkbox, Container, Group, Image, Stack, Text, Title } from '@mantine/core';
import { ContentsOptions, SearchResult } from 'exa-js';
import { generateSearchQueries, getSearchResults } from '../helpers';

import React from 'react';
import { SearchResultPreview } from './SearchResultPreview';
import fs from 'fs';

export const maxDuration = 15



export default async function Page({ searchParams }: { searchParams: { topic: string, sections: string[] } }) {
    if (!Array.isArray(searchParams.sections)) {
        if (searchParams.sections) {
            searchParams.sections = [searchParams.sections]
        } else {
            searchParams.sections = []
        }
    }

    const SEARCH_RESULTS_PER_QUERY = 1
    const QUERIES_PER_SECTION = 1

    const queryProms = searchParams.sections.map(section => generateSearchQueries(section, QUERIES_PER_SECTION))
    const queries = (await Promise.all(queryProms)).flat()

    // const searchResults = await getSearchResults(queries, SEARCH_RESULTS_PER_QUERY);
    // fs.writeFileSync('searchResults.json', JSON.stringify(searchResults))


    const searchResults: SearchResult<ContentsOptions>[] = JSON.parse(fs.readFileSync('searchResults.json', 'utf-8'))

    console.log(searchParams.sections)


    return (
        <Box >

            <Title mb={"md"} pt={"xl"} order={2}>{searchParams.topic}</Title>

            <form>

                <Stack>
                    {searchResults.map((sr, i) => (
                        <SearchResultPreview key={i} searchResult={sr} />
                    ))}
                </Stack>

            </form>
        </Box>
    );
}


