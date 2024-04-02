"use server"

import { IResp, sleep } from "@/utils"
import { formatPipeline, getDataFormatted, pipelineRunFormatter } from "@/server/formatAgent"
import { runContractExtraction, runSingleExtraction } from "@/server/extractionAgent"

import { categorize } from "@/server/categoryAgent"
import { getFormatterShape } from "@/shared/getFormatterShape"
import { revalidatePath } from "next/cache"
import { serverActionClient } from "@/supabase/ServerClients"
import { zodObjectToXML } from "@/zodUtils"

// import {} from 'openai'
export async function reviewContractAction(contractId: string) {
    const supabase = serverActionClient()

    runContractExtraction(supabase, contractId).then(console.log)
}
export async function completeContractAction(contractId: string) {
    const supabase = serverActionClient()

    const update = await supabase.from('contract').update({ completed: true }).eq('id', contractId).select().single()

    if (update.error) {
        console.error(update.error)
        return { error: update.error }
    }

    // maybe move this into an effect return so it doesn't reaload the pdf.
    revalidatePath(`/portal/projects/${update.data.project_id}`)
}

export async function deleteContractExtractedInfo(contractId: string, projectId: string) {
    const supabase = serverActionClient()

    const { error: eiErr } = await supabase.from('annotation').delete().eq('contract_id', contractId).eq('is_user', false)
    const { error: jobErr } = await supabase.from('extract_jobs').delete().eq('contract_id', contractId)

    revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)


}

export async function reExtractTopic(contractId: string, parsletId: string) {
    const supabase = serverActionClient()


    const { data, error } = await supabase.from('extracted_information').delete().eq('contract_id', contractId).eq('parslet_id', parsletId)


    await runSingleExtraction(supabase, contractId, parsletId)



}

export async function runFormatters(contractId: string, projectId: string, target: string | null | undefined) {
    const supabase = serverActionClient()

    const { data, error } = await supabase.from('project').select().eq('id', projectId).single()

    target ??= data?.target.join(", ")

    formatPipeline(supabase, contractId, target ?? "No target found")
    // revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)


}
export async function format(formatterKey: string, contractId: string, projectId: string, target: string | null | undefined, dataInput:string) : Promise<IResp<any[]>> {
    const supabase = serverActionClient()

    const { data, error } = await supabase.from('project').select().eq('id', projectId).single()
    target ??= data?.target.join(", ")


    const res = await getDataFormatted(zodObjectToXML(getFormatterShape(formatterKey)), getFormatterShape(formatterKey), target ?? "No target found", dataInput, "gpt-3.5-turbo")
    // revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)

    return res

}

export async function describeAndTag(contractId: string, projectId: string, target: string | null | undefined) {
    const supabase = serverActionClient()

    const { data, error } = await supabase.from('project').select().eq('id', projectId).single()

    target ??= data?.target.join(", ")


    const res = await categorize(supabase, contractId, projectId, target ?? "No target found")

    if (res.error) {
        throw new Error(res.error.message)
    }
    revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)


}