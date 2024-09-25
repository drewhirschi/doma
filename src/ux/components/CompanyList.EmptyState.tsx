"use client"

import { Box, Button, Center, Stack, Text, Title } from "@mantine/core"

import { AddCompanyDrawer } from "./CompanyList.AddDrawer"

export function EmptyCompanyListState() {
    return (
        <Center >
            <Stack mt={"sm"}>

                <Title order={3} ta={"center"}>No companies found</Title>

                <Text c="dimmed" ta="center" >
                    Try adjusting your search.
                </Text>
                <AddCompanyDrawer/>
            </Stack>

        </Center>
    )
}