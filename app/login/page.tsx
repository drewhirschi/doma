"use client";

import { AuthTokenResponse, Session } from '@supabase/supabase-js';
import { Box, Button, Center, Container, Group, Paper, Stack, TextInput, ThemeIcon, Title } from '@mantine/core';
import { IconLogin2, IconPhoto } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { browserClient } from '@/shared/supabase-client/BrowserClient';

function PasswordLoginForm() {

    const supabase = browserClient()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter()




    return (
        <Box maw={300} mx="auto">
            <TextInput
                label="Email"
                placeholder="Your email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
            />
            <TextInput
                label="Password"
                placeholder="Your password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
            />
            <Group justify='flex-end' mt="md">
                <Button onClick={async () => {
                    const result = await supabase.auth.signInWithPassword({ email, password })
                    if (result.error) {
                        console.log(result.error)
                    } else {

                        router.push("/portal/projects")
                    }
                }}>Log in</Button>
            </Group>
        </Box>
    );
}

export default function Home() {
    const supabase = browserClient();

    let origin = '';
    if (typeof window !== 'undefined') {
        origin = window.location.origin;
    }

    const router = useRouter()
    const searchParams = useSearchParams()

   

    useEffect(() => {


        supabase.auth.getUser().then((res) => {

            const { user } = res.data

            if (!user) {
                router.replace(searchParams.get("from") || `/portal/projects`)
            }
        })
    }, [])



    return <Center
        h={"100vh"}
    >
        <Paper
            shadow='sm'
            p="lg"
            bg={"gray.0"}
        >

            <Stack>
                <Group>
                    <ThemeIcon variant="light">
                        <IconLogin2 style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Title order={2}>Login to Parsl</Title>
                </Group>
                <Auth
                    supabaseClient={supabase}
                    onlyThirdPartyProviders
                    // view='sign_in'
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'azure']}
                    providerScopes={{
                        azure: 'openid, profile, email',
                        google: 'https://www.googleapis.com/auth/userinfo.email'
                    }}
                    queryParams={{
                        access_type: 'offline',
                        prompt: 'consent',
                    }}

                    redirectTo={`${origin}/auth/callback`}



                />
                <PasswordLoginForm />
            </Stack>
        </Paper>
    </Center>

} 
