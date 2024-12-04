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


  if (user.user.app_metadata.tenant_id) {
    redirect("/portal/projects");
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

  // we have to use the service client here bc RLS checks the tenant_id to know if the user can update the row
  // but the profile row doesn't have a tenant_id until after this call.
  const { data: profileUpdate, error: profileUpdateError } = await dangerousClient
    .from("profile")
    .update({ tenant_id: createTenant.data.id })
    .eq("id", user.user.id);

  if (profileUpdateError) {
    throw profileUpdateError;
  }

  await supabase.auth.refreshSession();

  redirect("/portal/projects");
}
