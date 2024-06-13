"use server"

import PQueue from "p-queue"
import { convertProjectWordFiles } from "@/actions/convertWordFiles"
import fs from "fs"
import path from "path"
import { queueProjectContracts } from "@/actions/queueProject"
import { revalidatePath } from "next/cache"
import { serverActionClient } from "@/supabase/ServerClients"

export async function queueProject(projectId: string) {
    await queueProjectContracts(projectId)
}

export async function linifyContracts(projectId: string) {

    const sb = serverActionClient()
    const contractsq = await sb.from('contract').select("id, display_name").eq('project_id', projectId).eq('linified', false).ilike('name', '%.pdf')

    if (contractsq.error) {
        console.error(contractsq.error)
        throw new Error("Failed to fetch contracts")
    }


    const contacts = contractsq.data

    const queue = new PQueue({ concurrency: 10 });


    const proms = contacts.map(async (c) => {
        const task = async () => {
            console.log('parsing', c.id)
            const res = await fetch('https://xjedm27xqhz6bycbmrdwr4n2ve0ywpli.lambda-url.us-west-2.on.aws/', {
                method: 'POST',
                body: JSON.stringify({
                    contractId: c.id
                })
            })

            if (!res.ok) {
                const errorText = await res.text()
                console.error(`Failed ${c.id}`,res.status,errorText)
                throw new Error(errorText)
            }




        }

        return queue.add(task)
    })

    const result = await Promise.allSettled(proms)

    const nSuccess = result.reduce((acc, d) => {

        if (d.status === 'fulfilled') {
            acc++
        }
        return acc
    }, 0)

    console.log(`${nSuccess}/${result.length} contracts linified.`)
    revalidatePath(`/portal/projects/${projectId}`)

}

export async function convertWordFiles(projectId: string) {





    const sb = serverActionClient()

    await convertProjectWordFiles(sb, projectId)


}