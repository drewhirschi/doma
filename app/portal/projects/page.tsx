import { Badge, Button, Card, Container, Grid, Group, Image, Space, Text } from "@mantine/core";

import ProjectCard from "@/components/ProjectCard";
import { ProjectGrid } from "./ProjectGrid";
import { serverClient } from "@/supabase/ServerClients";

export default async function Page() {

    const supabase = serverClient()
    const projectFetch = await supabase.from("project").select("*")
    const userFetch = await supabase.from("profile").select("*")

    console.log(userFetch.error)
    return <Container>
        <ProjectGrid projectFetch={projectFetch}
        userFetch={userFetch}/>
    </Container>
}