"use client"

import { Button } from '@mantine/core';
import React from 'react';
import { browserClient } from '@/supabase/BrowserClient';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    return (
        <div>
            <h1>Your account is not part of an tenant.</h1>
            <p>If you believe this is an error, please email <a href="mailto:drew@parslai.com">drew@parslai.com</a>.</p>
            <Button onClick={async () => {
                const sb = browserClient();

                await sb.auth.signOut();

                router.push("/login");
            }}>Logout</Button>
        </div>
    );
}