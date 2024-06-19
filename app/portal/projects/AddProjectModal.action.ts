"use server"

import { CreateFormValues } from "./AddProjectsModal";
import { FormatterKeys } from "@/types/enums";
import { get } from "http";
import { getUserTenant } from "@/shared/getUserTenant";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { serverActionClient } from "@/supabase/ServerClients";

export async function createProject(projectData: CreateFormValues) {
    const supabase = serverActionClient()
    const tenant_id = await getUserTenant(supabase)

    if (!tenant_id) {
        throw new Error("failed to get tenant id")
    }

    const { data: insertFormData, error: createProjectError } = await supabase
        .from('project')
        .insert({
            tenant_id: tenant_id!,
            deal_structure: projectData.dealStructure,
            display_name: projectData.projectName,
            client: projectData.client,
            counterparty: projectData.counterparty,
            target: projectData.targetNames,
            phase_deadline: projectData.phaseDeadline.toISOString()
        })
        .select()


    if (createProjectError) {
        throw new Error("failed to create project")
    }
    const project_id = insertFormData[0].id

    const assignAttorneysRes = await upsertAssignedAttorneys(project_id, projectData.assignedAttorneys)
    const setupDefaultFormattersRes = await setupDefaultFormatters(project_id)


    revalidatePath(`/portal/projects`)
    redirect(`/portal/projects/${project_id}/tabs/overview`)
}

async function upsertAssignedAttorneys(project_id: string, assignedAttorneys: string[]) {
    const supabase = serverActionClient()


    const { data, error } = await supabase
        .from('project_assignment')
        .insert(
            assignedAttorneys.map((profile_id) => (
                {
                    project_id,
                    profile_id,
                }))
        );

    if (error) {
        console.error('Error adding project assignments', error);
        throw new Error(error.message);
    }


};

async function setupDefaultFormatters(project_id: string) {
    const supabase = serverActionClient()



    const defaultFormatterKeys = Object.values(FormatterKeys)
        .filter(k => k !== FormatterKeys.trojans)
        .filter(k => k !== FormatterKeys.effectsOfTransaction)
        .filter(k => k !== FormatterKeys.incorporatedAgreements)

    const itemsToInsert = defaultFormatterKeys.map(k => ({ project_id: project_id, formatter_key: k }))

    // for (const formatterKey of defaultFormatterKeys) {

    //     try {
            
    //         const res = await supabase
    //         .from('project_formatters')
    //         .insert({ project_id: project_id, formatter_key: formatterKey }).throwOnError()
    //     } catch (error) {
    //         console.log('failed on formatter', formatterKey, error)
    //     }

    // }

    return await supabase
        .from('project_formatters')
        .insert(itemsToInsert)

}