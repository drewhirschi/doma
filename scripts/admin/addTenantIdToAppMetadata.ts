import { fullAccessServiceClient } from "@/shared/supabase-client/server";

const supabase = fullAccessServiceClient();

async function main() {
  const userId = "31a07cea-4b1e-45ed-9f30-cc8d63ce2441";
  const tenant_id = "198cfdbd-8e76-4f87-8907-6c0e76a5e847";

  const { data: user, error: userError } =
    await supabase.auth.admin.getUserById(userId);

  const { data: tenant, error: tenantError } = await supabase
    .from("tenant")
    .select("*")
    .eq("id", tenant_id)
    .single();

  if (tenantError) {
    throw tenantError;
  }

  const { data: userupdate, error: userUpdateError } =
    await supabase.auth.admin.updateUserById(userId, {
      app_metadata: { ...user.user?.app_metadata, tenant_id },
    });

  // add tenant to user profile
  const { data: profileUpdate, error: profileUpdateError } = await supabase
    .from("profile")
    .update({ tenant_id })
    .eq("id", userId);

  if (userUpdateError || profileUpdateError) {
    console.error(userUpdateError || profileUpdateError);
  } else {
    console.log(`success, added ${userupdate.user.email} to ${tenant.name}`);
  }
}

main();
