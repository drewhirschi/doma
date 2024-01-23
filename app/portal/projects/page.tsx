import { Badge, Button, Card, Container, Grid, Group, Image, Space, Text } from "@mantine/core";

import { ProjectGrid } from "./ProjectGrid";
import { serverClient } from "@/supabase/ServerClients";

export default async function Page() {

    const supabase = serverClient()
    const projectFetch = await supabase.from("project").select("*, profile(*), contract(completed)")
    const userFetch = await supabase.from("profile").select("*")

    if (!projectFetch.data || !userFetch.data) {
        console.error(projectFetch.error, userFetch.error)
        throw new Error("Failed to fetch data")
    }

    return (
        <Container mt="xl">
            <ProjectGrid
                projects={projectFetch.data}
                users={userFetch.data}
            />
        </Container>
    )
}