import { Anchor, Box, Center, Container, Divider, Grid, GridCol, Group, Image, Paper, SimpleGrid, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text, Title } from "@mantine/core";
import { IconMessageCircle, IconPhoto, IconSettings } from "@tabler/icons-react";

import { FrostedGlassSVG, } from "./GlassPane";
import GridBackground from "@/components/GridBackground";
import LoginButton from "./LoginButton";
import { Meteors } from "@/components/Meteors";
import NextImage from 'next/image';
import { ReactNode } from "react";
import { WaitlistSignup } from "./WaitlistSignup";
import classes from './page.module.css';

function DescriptionItem({ header, text }: { header: string, text: ReactNode }) {
  return (
    <Box>
      <Title order={4}>{header}</Title>
      <Text mt={"sm"}>{text}</Text>
    </Box>
  )
}




export default function HomePage() {



  return (
    <Box style={{ overflow: 'hidden', scrollBehavior: "smooth" }} miw={350} c={"gray.8"}>

      <Group justify="flex-end"><LoginButton /></Group>




      <div style={{ position: "relative" }}>
        <GridBackground />
        <Meteors />

        <Container style={{ zIndex: 2, position: "relative" }} >
          <Center h={"95vh"}>
            <Stack align="center" maw={800}>

              <Text style={{ textAlign: 'left', alignSelf: "flex-start", fontWeight: 400, fontSize: 64 }} variant="gradient" gradient={{ from: 'dark.8', to: 'dark.3', deg: -45 }}
              >Parsl</Text>
              <Title order={1} ta={"center"}>Accurate Legal Due Diligence for M&A</Title>
              <WaitlistSignup />

            </Stack>
          </Center>
        </Container>
      </div>





      <Stack py={60} >
        <Container
          size={"1200px"}
        //  className={classes.responsiveContainer}
        >


          <Stack >
            <Title order={1}>Gain the upper hand, make informed bids sooner</Title>
            <Grid
              gutter={"xl"}

            >

              <GridCol span={{ base: 12, md: 4 }}>
                <Text mb={"sm"} size="xl">Don&apos;t wait weeks to surface the data you need to make a confident decision. Get a comprehensive analysis in minutes.</Text>
                <WaitlistSignup />
              </GridCol>
              <GridCol span={{ base: 12, md: 8 }}>

                <Image
                  radius={"md"}
                  // component={NextImage} 
                  width={750} height={500} src={null} alt="My image"
                  fallbackSrc="https://placehold.co/600x400?text=Placeholder" />
              </GridCol>
            </Grid>
          </Stack>



        </Container>
      </Stack >

      <Divider />




      <Box py={60}>
        <Container size={"1200px"}
        // className={classes.responsiveContainer}/
        >


          <Stack >
            <Title order={1}>Slash your legal spend</Title>
            <Grid
              gutter={"xl"}

            >
              <GridCol span={{ base: 12, md: 8 }}>

                <Image
                  radius={"md"}

                  // component={NextImage} 
                  width={750} height={500} src={null} alt="My image"
                  fallbackSrc="https://placehold.co/750x500?text=Example" />
              </GridCol>
              <GridCol span={{ base: 12, md: 4 }}>
                <Text mb={"sm"} style={{ alignSelf: "flex-end" }} size="xl">Be prepared by catching and resolving deal issues that would add to your attorney&apos;s workload and cause unnecessary delays that naturally increase your bill.</Text>
                <WaitlistSignup />
              </GridCol>
            </Grid>
          </Stack>



        </Container>
      </Box>

      <Divider />


      <Box py={60}>
        <Container size={"1200px"}
        // className={classes.responsiveContainer}
        >


          <Stack >
            <Title order={1}>Mitigate risk with improved accuracy</Title>
            <Grid gutter={"xl"}>

              <GridCol span={{ base: 12, md: 4 }}>
                <Text mb={"sm"} size="xl">Catch details that can be missed by sleep deprived junior associates. AI-assisted review is the best of both worlds.</Text>
                <WaitlistSignup />
              </GridCol>
              <GridCol span={{ base: 12, md: 8 }}>
                <Image
                  radius={"md"}

                  // component={NextImage} 
                  width={750} height={500} src={null} alt="My image"
                  fallbackSrc="https://placehold.co/600x400?text=Placeholder" />
              </GridCol>
            </Grid>
          </Stack>



        </Container>
      </Box>

      <Divider />



      <FrostedGlassSVG>
        <div></div>


        <Box pt={"10vh"} pb={"15vh"} pos={"relative"}>
          <Meteors />

          <Container style={{ zIndex: 2 }} pos={"relative"}>
            <Stack gap={"sm"} align="center">

              <Title mb={"sm"}>Parsl in action</Title>
              <div
                className={classes.videoIframe}

              >
                <iframe
                  // width="560" height="315"
                  src="https://www.youtube.com/embed/PlgKMQCawaM?si=kXJcVckA78rEfQhJ"
                  width="100%"
                  height="100%"
                  title="Parsl Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen></iframe>
              </div>

            </Stack>
          </Container>
        </Box>
      </FrostedGlassSVG>

      <Box bg={"dark.7"} mih={500} c={"white"}>






        <Grid py={"xl"} id="footer">
          <GridCol span={{ base: 12, md: 6 }}>
            <Group justify="center" >© 2024 Atlas Technology LLC. All rights reserved.</Group>
          </GridCol>
          <GridCol span={{ base: 12, md: 6 }}>
            <Stack justify="center" align="center">
              <Anchor c={"white"} fw={700} href="/docs/privacy-policy.pdf">Privacy Policy</Anchor>
              <Anchor c={"white"} fw={700} href="/docs/terms-of-use.pdf">Terms of Service</Anchor>
            </Stack>
          </GridCol>
        </Grid>
      </Box>



    </Box >
  )
}




