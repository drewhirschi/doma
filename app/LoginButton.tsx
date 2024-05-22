'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@mantine/core';
import Link from 'next/link';
import { browserClient } from '@/supabase/BrowserClient';

// interface ILoginButtonProps { }

export default function LoginButton() {
    const [nextUrl, setNextUrl] = useState("/login");
    const supabase = browserClient();

    useEffect(() => {
        // effect

        supabase.auth.getSession().then((sessionq) => {
            if (sessionq.data.session) {
                setNextUrl("/portal/projects");
            }
        })
      
    }, [supabase.auth])

    return (
        <Button m={"md"} href={nextUrl} component={Link} variant="subtle">Login</Button>
    );
}