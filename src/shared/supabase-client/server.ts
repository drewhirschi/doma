import { type CookieOptions, createServerClient } from "@supabase/ssr";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "./envs";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("No service role key");
  // throw new Error("No service role key")
}
if (!SUPABASE_ANON_KEY) {
  console.error("No anon key");
  // throw new Error("No anon key")
}
if (!SUPABASE_URL) {
  console.error("No supabase url");
  // throw new Error("No supabase url")
}

/**
 * DANGEROUS Creates a full access service client for supabase.
 *
 * @returns {SupabaseClient<Database>} The database client.
 * @throws {Error} If the SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set.
 */
export const fullAccessServiceClient = () =>
  createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

export const serverClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
};

export const routeClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
};

export const serverActionClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
};
