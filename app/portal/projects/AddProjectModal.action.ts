"use server"

import { CreateFormValues } from "./AddProjectsModal";
import { get } from "http";
import { getUserTenant } from "@/shared/getUserTenant";
import { revalidatePath } from "next/cache";
import { serverActionClient } from "@/supabase/ServerClients";

export async function createProject(projectData: CreateFormValues) {
    const supabase = serverActionClient()
    const tenant_id = await getUserTenant(supabase)

    if (!tenant_id) {
        throw new Error("failed to get tenant id")
    }

    const { data: insertFormData, error: insertFormError } = await supabase
        .from('project')
        .insert({ tenant_id: tenant_id!, deal_structure: projectData.dealStructure, display_name: projectData.projectName, client: projectData.client, counterparty: projectData.counterparty, target: projectData.targetNames, phase_deadline: projectData.phaseDeadline.toISOString() })
        .select()
    console.log(insertFormData)
    console.log(insertFormError)

    if (!insertFormData) {
        throw new Error("failed to insert new project row")
    }
    const project_id = insertFormData[0].id

    upsertAssignedAttorneys(project_id, projectData.assignedAttorneys);

    revalidatePath("/portal/projects")
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