"use server";

import { revalidatePath } from "next/cache";
import { serverActionClient } from "@/shared/supabase-client/server";

export async function updateContractAssignment(
  assigneeId: string,
  contractId: string,
) {
  const supabase = serverActionClient();

  await supabase
    .from("contract")
    .update({ assigned_to: assigneeId })
    .eq("id", contractId);
  revalidatePath("/");
}
