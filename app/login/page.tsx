"use client";

import { Center, Container, Group, Paper, Stack, ThemeIcon, Title } from '@mantine/core';
import { IconLogin2, IconPhoto } from '@tabler/icons-react';

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { browserClient } from '../../src/supabase/BrowerClients';
import { useEffect } from 'react';

// import { useRouter } from "next/navigation";

export default function Home() {
    const supabase = browserClient();
    
    let origin = '';
    if (typeof window !== 'undefined') {
        origin = window.location.origin;
    }

  
   



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
                <Auth supabaseClient={supabase}
                    onlyThirdPartyProviders

                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'azure']}

                    redirectTo={`${origin}/auth/callback`}
                    // redirectTo={`${origin}/auth/confirm`}
                    
                    queryParams={{
                        access_type: 'offline',
                        prompt: 'consent',
                    }}

                />
            </Stack>
        </Paper>
    </Center>
}
