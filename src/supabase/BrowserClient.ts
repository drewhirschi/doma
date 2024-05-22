import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./envs";

import { Database } from "@/types/supabase";
import { createBrowserClient } from "@supabase/ssr";

console.log(SUPABASE_URL, SUPABASE_ANON_KEY)

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