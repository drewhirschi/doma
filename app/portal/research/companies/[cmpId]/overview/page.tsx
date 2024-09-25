import { Box, Button } from '@mantine/core';

import { ProjectWithModelCmp } from '../types';
import React from 'react';
import Tab from './tab';
import { serverClient } from '@/shared/supabase-client/ServerClients';

export default async function Page({
    params,
}: {
    params: { cmpId: string }
}) {
    const sb = serverClient();


    const companyProfileGet = await sb.from("company_profile").select("*").eq("id", params.cmpId).single();

    return (
        <Box bg={"gray.1"} h={"100%"} w={"100%"}>
            <Tab companyProfile={companyProfileGet.data!} />
        </Box>

    );
}