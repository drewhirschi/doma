import { Anchor, Box, Center, Container, Divider, Grid, GridCol, Group, Image, List, ListItem, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import GridBackground from "@/components/GridBackground";
import LoginButton from "../../LoginButton";
import { Metadata } from "next";
import { Meteors } from "@/components/Meteors";
import { WaitlistSignup } from "../../WaitlistSignup";
import styles, { } from './page.module.css';

export const metadata: Metadata = {
    title: 'Parsl AI',
    description: 'Accurate AI Legal Due Diligence for M&A',
    keywords: "Parsl, AI Due Diligence, AI M&A",
    authors: { name: "Atlas Technology", url: "https://parslai.com" },
    openGraph: {
        type: "website",
        title: "Parsl AI",
        description: "Accurate AI Legal Due Diligence for M&A",
        images: "https://parslai.com/images/product/landing_preview.png",
        url: "https://parslai.com",

    }

}


export default function HomePage() {



    return (

        <Box style={{ overflow: 'hidden', scrollBehavior: "smooth" }} miw={350} c={"gray.8"} className={styles.landingPageContainer}>

            <Group justify="flex-end"><LoginButton /></Group>




            <div style={{ position: "relative" }}>
                <GridBackground />
                <Meteors />

                <Container style={{ zIndex: 2, position: "relative" }} >
                    <Center h={"95vh"}>
                        <Stack align="center" maw={800}>

                            <Text style={{ textAlign: 'left', alignSelf: "flex-start", fontWeight: 400, fontSize: 64 }} variant="gradient" gradient={{ from: 'dark.8', to: 'dark.3', deg: -45 }}
                            >Parsl</Text>
                            <Title order={1} ta={"center"}>Spending weeks populating your data room?  We can automate that.</Title>
                            <WaitlistSignup />

                        </Stack>
                    </Center>
                </Container>
            </div>








        </Box >
    )
}




