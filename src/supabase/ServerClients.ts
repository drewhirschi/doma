import { type CookieOptions, createBrowserClient, createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server'

import { cookies } from 'next/headers'
import { Database } from '@/types/supabase-generated';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

/**
 * DANGEROUS Creates a full access service client for supabase.
 * 
 * @returns {SupabaseClient<Database>} The database client.
 * @throws {Error} If the SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set.
 */
export const fullAccessServiceClient = () => createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)


export const serverClient = () => {
    const cookieStore = cookies()
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )
}



export const routeClient = () => {
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    )
}

export const serverActionClient = () => {
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    )
}


