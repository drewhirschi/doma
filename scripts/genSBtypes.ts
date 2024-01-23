import { $, file } from "bun";

// as a file()
await $`bunx supabase gen types typescript --linked --schema public > src/types/supabase-generated.ts`;


