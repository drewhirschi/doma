import { Box, Container, Image, Text } from '@mantine/core';

import Markdown from 'react-markdown'
import React from 'react';
import { serverClient } from '@/shared/supabase-client/ServerClients';

export default async function Page({ params }: { params: { blogId: string } }) {

    const sb = serverClient()

    const article = await sb.from('blog_article').select('*').eq('id', Number(params.blogId)).single()

    if (article.error) {
        console.error(article.error)
        return <div>Article not found</div>
    }

    const date = new Date(article.data.created_at)

    return (
        <div>
            <Container mb={"xl"}>
                <Image
                    src={article.data.cover_img}
                />
                <h1>{article.data.title}</h1>
                <Text c="dimmed" fw={600}>
                {article.data.author} | {date.toLocaleDateString()}
                </Text>
                    

                <Markdown >
                    {article.data.md}
                </Markdown>
            </Container>
        </div>
    );
}