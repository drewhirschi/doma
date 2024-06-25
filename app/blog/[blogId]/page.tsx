import { Box, Container, Image } from '@mantine/core';

import Markdown from 'react-markdown'
import React from 'react';
import { serverClient } from '@/supabase/ServerClients';

export default async function Page({ params }: { params: { blogId: string } }) {

    const sb = serverClient()

    const article = await sb.from('blog_article').select('*').eq('id', Number(params.blogId)).single()

    if (article.error) {
        console.error(article.error)
        return <div>Sorry we couldn't find that article</div>
    }

    const date = new Date(article.data.created_at);

    return (
        <div>
            <Container>
                <Image
                    src={article.data.cover_img}
                />
                <h1>{article.data.title}</h1>
                {date.toLocaleDateString()}

                <Markdown >
                    {article.data.md}
                </Markdown>
            </Container>
        </div>
    );
}