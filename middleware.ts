import { createMiddlewareClient } from '@/utils/supabase/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { redirect } from 'next/navigation';
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {

    const { supabase, response } = createMiddlewareClient(request)

    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user && request.nextUrl.pathname.startsWith("/portal")) {
        // const redirectUrl = request.url ? encodeURIComponent(request.url) : '/';
        return NextResponse.redirect(new URL(`/login`, request.url))
    }

    if (!user?.app_metadata?.tenant_id) {
        redirect(`/portal/no-tenant`)
    }



    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}