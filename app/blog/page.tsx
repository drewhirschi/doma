import { Button, Card, CardSection, Container, Divider, Group, Image, SimpleGrid, Text } from '@mantine/core';

import Link from 'next/link';
import React from 'react';
import { serverClient } from '@/shared/supabase-client/ServerClients';

export default async function Page() {

    const { data: articles, error } = await serverClient()
        .from('blog_article')
        .select('id, title, created_at, cover_img, md')
        .order('created_at', { ascending: false })
        .limit(5)


    if (error) {
        console.error(error);
        return <div>Error loading articles</div>;
    }

    return (
        <div>

            <Container>
                <h1>Welcome to the Parsl Blog</h1>

                <h3>Recent Articles</h3>
                <Divider pb={"md"} />

                <SimpleGrid cols={2}>

                    {articles.map((article) => {

                        const date = new Date(article.created_at);

                        return <Card
                            key={article.id}
                            shadow="sm"
                            padding="lg"
                            radius="md"
                            withBorder
                            component={Link}
                            href={`/blog/${article.id}`}
                        >
                            <CardSection>
                                <Image
                                    src={article.cover_img}
                                    height={160}
                                    alt="Norway"
                                />
                            </CardSection>

                            <Group justify="space-between" mt="md" mb="xs">
                                <Text fw={500}>{article.title}</Text>
                            </Group>
                            {/* {date.toLocaleDateString()} */}

                            <Text size="sm" c="dimmed">
                                {article.md?.split('\n')[0]}
                            </Text>


                        </Card>
                    })}
                </SimpleGrid>
            </Container>
        </div>
    );
}