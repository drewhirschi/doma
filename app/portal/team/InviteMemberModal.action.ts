"use server";

import {
  fullAccessServiceClient,
  serverActionClient,
} from "@/shared/supabase-client/server";

import { CreateProfileValues } from "./InviteMemberModal";
import { getUserTenant } from "@/shared/getUserTenant";
import { revalidatePath } from "next/cache";

function getRandomColor(): string {
  const saturation = 100; // Adjust for vibrancy
  const lightness = 40; // Adjust for brightness

  let hue = Math.floor(Math.random() * 360); // Random hue for variety
  const color = `hsl(${hue},${saturation}%,${lightness}%)`;

  return color;
}

export async function createProfile(profileData: CreateProfileValues) {
  const serviceClient = fullAccessServiceClient();
  const supabase = serverActionClient();

  const userRes = await supabase.auth.getUser();
  const tenant_id = userRes.data.user?.app_metadata.tenant_id || null
  if (!tenant_id) throw new Error("could not find tenant_id")

  const tenantGet = await supabase.from("tenant").select("*").eq("id", tenant_id).single();
  if (tenantGet.error) throw new Error("could not fetch tenant");

  const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(
    profileData.email,
    {
      data: {
        tenant_id,
        color: getRandomColor(),
        tenant_name: tenantGet.data.name,
        invitor_email: userRes.data.user?.email
      },
      redirectTo: process.env.AUTH_URL + "/portal/projects"
    },
  );

  if (error) {
    console.log(error);
    throw new Error("failed to send email/add new profile");
  }

  const addTenant = await serviceClient.auth.admin.updateUserById(data.user.id, {
    app_metadata: {
      tenant_id: tenant_id,
    }
  })

  const profileUpdate = await supabase.from("profile").update({ "display_name": profileData.name }).eq("id", data.user.id).single();

  revalidatePath("/portal/team");
}
