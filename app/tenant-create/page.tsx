'use client';

import { Box, Button, Center, Paper, Stack, TextInput } from '@mantine/core';
import React, { useState } from 'react';

import { createTenantAndAssignUser } from './actions';

interface IpageProps { }

export default function page() {
    const [tenantName, setTenantName] = useState("");
    return (
        <Box h="100vh" w="100vw">
            <Center h={"80%"}>
                <Paper
                shadow='md'
                withBorder
                p={"md"}
                
                >

                    <Stack w={300}>

                        Set up your tenant
                        <TextInput
                            label='Name'
                            placeholder='Your company name'
                            onChange={(e) => setTenantName(e.currentTarget.value)}
                        />
                        <Button onClick={async () => { 
                            createTenantAndAssignUser(tenantName)
                        }}>Save</Button>

                    </Stack>
                </Paper>
            </Center>
        </Box>
    );
}