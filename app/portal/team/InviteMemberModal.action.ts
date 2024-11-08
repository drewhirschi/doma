"use server";

import { fullAccessServiceClient, serverActionClient } from "@/shared/supabase-client/server";

import { CreateProfileValues } from "./InviteMemberModal";
import { getUserTenant } from "@/shared/getUserTenant";
import { revalidatePath } from "next/cache";

function getRandomColor(): string {
  const saturation = 100; // Adjust for vibrancy
  const lightness = 40; // Adjust for brightness

  let hue = Math.floor(Math.random() * 360); // Random hue for variety
  return `hsl(${hue},${saturation}%,${lightness}%)`;
}

export async function createProfile(profileData: CreateProfileValues) {
  const serviceClient = fullAccessServiceClient();
  const supabase = serverActionClient();

  try {
    const userRes = await supabase.auth.getUser();
    const tenant_id = userRes.data.user?.app_metadata.tenant_id || null;
    if (!tenant_id) throw new Error("Could not find tenant_id");

    const tenantGet = await supabase.from("tenant").select("*").eq("id", tenant_id).single();
    if (tenantGet.error) throw new Error("Could not fetch tenant");

    const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(profileData.email, {
      data: {
        tenant_id,
        color: getRandomColor(),
        tenant_name: tenantGet.data.name,
        invitor_email: userRes.data.user?.email,
      },
      redirectTo: process.env.AUTH_URL + "/portal/projects",
    });

    if (error) {
      console.error("Error sending email/adding new profile:", error);
      return { success: false, message: "Failed to send email/add new profile" };
    }

    const addTenant = await serviceClient.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
        tenant_id: tenant_id,
      },
    });

    const profileUpdate = await supabase
      .from("profile")
      .update({ display_name: profileData.name })
      .eq("id", data.user.id)
      .single();

    revalidatePath("/portal/team");
    return { success: true, message: "Profile created successfully" };
  } catch (error) {
    console.error("Error creating profile:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}
