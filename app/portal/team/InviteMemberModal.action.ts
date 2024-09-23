"use server"

import { CreateProfileValues } from "./InviteMemberModal";
import { fullAccessServiceClient } from "@/shared/supabase-client/ServerClients";
import { getUserTenant } from "@/shared/getUserTenant";
import { serverActionClient } from "@/shared/supabase-client/ServerClients";

function getRandomColor(): string {
    const saturation = 100; // Adjust for vibrancy
    const lightness = 40; // Adjust for brightness

    let hue = Math.floor(Math.random() * 360); // Random hue for variety
    const color = `hsl(${hue},${saturation}%,${lightness}%)`;

    return color;
}

export async function createProfile(profileData: CreateProfileValues) {

    const serviceClient = fullAccessServiceClient()
    const supabase = serverActionClient()
    const tenant_id = await getUserTenant(supabase)
    if (!tenant_id) (
        console.log("could not find tenant_id")
    )
    const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(profileData.email, { data: { tenant_id, color: getRandomColor() } })

    if (error) {
        console.log(error)
        throw new Error("failed to send email/add new profile")
    }
}
