"use server";

import {
  fullAccessServiceClient,
  serverActionClient,
} from "@/shared/supabase-client/server";

import { redirect } from "next/navigation";

export async function createTenantAndAssignUser(tenantName: string) {
  const dangerousClient = fullAccessServiceClient();
  const supabase = serverActionClient();
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const createTenant = await dangerousClient
    .from("tenant")
    .insert({ name: tenantName })
    .select()
    .single();

  if (createTenant.error) {
    throw createTenant.error;
  }

  const { data: userupdate, error: userUpdateError } =
    await dangerousClient.auth.admin.updateUserById(user.user.id, {
      app_metadata: {
        ...user.user?.app_metadata,
        tenant_id: createTenant.data.id,
      },
    });

  if (userUpdateError) {
    throw userUpdateError;
  }

  const { data: profileUpdate, error: profileUpdateError } = await supabase
    .from("profile")
    .update({ tenant_id: createTenant.data.id })
    .eq("id", user.user.id);

  if (profileUpdateError) {
    throw profileUpdateError;
  }

  await supabase.auth.getUser();

  redirect("/portal/projects");
}
