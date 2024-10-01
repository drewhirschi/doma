import { Box, Button } from "@mantine/core";

import { ProjectWithModelCmp } from "../types";
import React from "react";
import Tab from "./tab";
import { serverClient } from "@/shared/supabase-client/server";

export default async function Page({ params }: { params: { cmpId: string } }) {
  const sb = serverClient();

  const companyProfileGet = await sb
    .from("company_profile")
    .select("*, cmp_logos(*)")
    .eq("id", params.cmpId)
    .single();
  const logos = companyProfileGet.data?.cmp_logos ?? [];
  console.log(logos);

  return (
    <Box bg={"gray.1"} h={"100%"} w={"100%"}>
      <Tab companyProfile={companyProfileGet.data!} logos={logos} />
    </Box>
  );
}
