import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/shared/supabase-client/envs";

import { Database } from "@/shared/types/supabase";
import { createBrowserClient } from "@supabase/ssr";

if (SUPABASE_ANON_KEY === undefined) {
    console.error("No anon key")
    // throw new Error("No anon key")
}
if (SUPABASE_URL === undefined) {
    console.error("No supabase url")
    // throw new Error("No supabase url")
}

export const browserClient = () => createBrowserClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!
)