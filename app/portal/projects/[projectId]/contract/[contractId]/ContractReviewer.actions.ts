"use server"

import { IResp, sleep } from "@/utils"
import { formatPipeline, getDataFormatted, pipelineRunFormatter } from "@/agents/formatAgent"

import { categorize } from "@/agents/categoryAgent"
import { getFormatterShape } from "@/shared/getFormatterShape"
import { revalidatePath } from "next/cache"
import { runContractExtraction } from "@/actions/extraction"
import { runSingleExtraction } from "@/agents/extractionAgent"
import { serverActionClient } from "@/supabase/ServerClients"
import { startZuvaExtraction } from "@/zuva"
import { zodObjectToXML } from "@/zodUtils"

export async function reviewContractAction(contractId: string) {
    const supabase = serverActionClient()

    await runContractExtraction(supabase, contractId).then(console.log)
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
    const { error: infoErr } = await supabase.from('formatted_info').delete().eq('contract_id', contractId)
    const { error: lineRefErr } = await supabase.from('line_ref').delete().eq('contract_id', contractId)

    revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)


}

export async function reExtractTopic(contractId: string, formatterKey: string) {
    const supabase = serverActionClient()


    // const { error: eiErr } = await supabase.from('annotation').delete().eq('contract_id', contractId).eq('is_user', false).
    // const { error: jobErr } = await supabase.from('extract_jobs').delete().eq('contract_id', contractId)
    // const { error: infoErr } = await supabase.from('formatted_info').delete().eq('contract_id', contractId)
    // const { error: lineRefErr } = await supabase.from('line_ref').delete().eq('contract_id', contractId)


    await runContractExtraction(supabase, contractId, {formatterKeys: [formatterKey]}).then(console.log)



}

export async function runFormatters(contractId: string, projectId: string, target: string | null | undefined) {
    const supabase = serverActionClient()

    const { data, error } = await supabase.from('project').select().eq('id', projectId).single()

    target ??= data?.target.join(", ")

    formatPipeline(supabase, contractId, target ?? "No target found")
    // revalidatePath(`/portal/projects/${projectId}/contract/${contractId}`)


}
export async function format(formatterKey: string, contractId: string, projectId: string, dataInput: string): Promise<IResp<any[]>> {
    const supabase = serverActionClient()

    // const projectq = await supabase.from('project').select().eq('id', projectId).single()
    const formatterq = await supabase.from('formatters').select().eq('key', formatterKey).single()
    const contractq = await supabase.from('contract').select("*, formatted_info(*)").eq('id', contractId).single()

    if (formatterq.error) {
        return { error: formatterq.error }
    } else if (contractq.error) {
        return { error: contractq.error }
    }


    const res = await getDataFormatted(formatterq.data, contractq.data, dataInput, true)

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


export async function zuvaExtraction(contractId:string) {

    const supabase = serverActionClient()

    startZuvaExtraction(supabase, contractId)

}