"use server"

import { serverActionClient } from "@/supabase/ServerClients";
import { CreateFormValues } from "./AddProjectsModel";
import { get } from "http";
import { getUserTenant } from "@/shared/getUserTenant";
import { revalidatePath } from "next/cache";

export async function createProject(projectData: CreateFormValues) {
    const supabase = serverActionClient()
    const tenant_id = await getUserTenant(supabase)
    const { data: insertFormData, error: insertFormError } = await supabase
        .from('project')
        // @ts-ignore
        .insert({ tenant_id: tenant_id, deal_structure: projectData.dealStructure, display_name: projectData.projectName, client: projectData.client, counterparty: projectData.counterparty, target: projectData.targetNames, phase_deadline: projectData.phaseDeadline })
        .select()
    console.log(insertFormData)
    console.log(insertFormError)

    if (!insertFormData) {
        throw new Error("failed to insert new project row")
    }
    const project_id = insertFormData[0].id

    upsertAssignedAttorneys(supabase, project_id, projectData.assignedAttorneys);

    revalidatePath("/portal/projects")
}

const upsertAssignedAttorneys = async (supabase: any, project_id: string, assignedAttorneys: string[]) => {
    try {
        await supabase
            .from('project_assignment')
            .upsert(
                [assignedAttorneys.map((profile_id) => (
                    {
                        project_id,
                        profile_id,
                    }))
                ],
                { onConflict: ['project_id', 'profile_id'] }
            );
        console.log('Upsert completed successfully.');
    } catch (error) {
        console.error('Error during upsert:', error);
    }
};