import { Container } from "@mantine/core";
import { ProjectGrid } from "./ProjectGrid";
import { redirect } from "next/navigation";
import { serverClient } from "@/supabase/ServerClients";
import { sleep } from "@/utils";

export default async function Page() {

    redirect("/portal/research")

    // const supabase = serverClient()
    // const projectFetch = await supabase.from("project").select("*, profile(*), contract(completed)")
    // .returns<(Project_SB & {profile:Profile_SB[], contract: {completed:boolean}[]})[]>()
    // const userFetch = await supabase.from("profile").select("*")

    // if (!projectFetch.data || !userFetch.data) {
    //     console.error(projectFetch.error, userFetch.error)
    //     throw new Error("Failed to fetch data")
    // }

    // return (
    //     <Container mt="xl">
    //         <ProjectGrid
    //             projects={projectFetch.data }
    //             users={userFetch.data}
    //         />
    //     </Container>
    // )
}