import { RedirectType, redirect } from 'next/navigation';

import { Json } from '@/shared/types/supabase-generated';
import type { NextRequest } from 'next/server';
import axios from 'axios'
import { exchangeCodeForToken } from '@/shared/oauth/microsoft';
import { routeClient } from '@/shared/supabase-client/server';

export const dynamic = "force-dynamic"
export async function GET(request: NextRequest) {
    console.log("handling")
    const params = new URLSearchParams(request.nextUrl.search);
    const code = params.get('code');

    const redirectUrl = `${process.env.AUTH_URL}/portal/settings`


    if (!code) {
        redirect(redirectUrl + `?error=missing_code`)
    }


    const resp = await exchangeCodeForToken(routeClient(), code)


    redirect(`${process.env.AUTH_URL}/portal/settings`)



}