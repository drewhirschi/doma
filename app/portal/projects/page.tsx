import { Badge, Button, Card, Container, Grid, Group, Image, Space, Text } from "@mantine/core";

import ProjectCard from "@/components/ProjectCard";
import { ProjectGrid } from "./ProjectGrid";
import { serverClient } from "@/supabase/ServerClients";

export default async function Page() {

    const supabase = serverClient()
    const projectFetch = await supabase.from("project").select("*")
    


    return <Container>
        <Button mb={"sm"} py="xs">New</Button>
        <ProjectGrid fetchRes={projectFetch}/>
        
    </Container>
}