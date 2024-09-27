"use server"

import { revalidatePath } from "next/cache"
import { serverActionClient } from '@/shared/supabase-client/server';

export async function createProject(title:string) {
    const sb = serverActionClient()


    const { data, error } = await sb
        .from('ib_projects')
        .insert([{ title }])
        .select()
        .single().throwOnError()


        revalidatePath('/portal/projects')

    return { data, error }

}



