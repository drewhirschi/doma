import { $, file } from "bun";

async function main() {

    // as a file()
    await $`bunx supabase gen types typescript --linked --schema public > src/types/supabase-generated.ts`;
}

main()


