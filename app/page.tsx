import { Anchor, Box, Center, Container, Divider, Grid, GridCol, Group, Image, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import GridBackground from "@/components/GridBackground";
import Head from "next/head";
import LoginButton from "./LoginButton";
import { Metadata } from "next";
import { Meteors } from "@/components/Meteors";
import { WaitlistSignup } from "./WaitlistSignup";
import styles, { } from './page.module.css';
import { theme } from "../theme";

export const metadata: Metadata = {
  title: 'Parsl AI',
  description: 'Accurate Legal Due Diligence for M&A',
  keywords: "Parsl, AI Due Diligence, AI M&A",
  authors: { name: "Atlas Technology", url: "https://parslai.com" },
  openGraph: {
    type: "website",
    title: "Parsl AI",
    description: "Accurate Legal Due Diligence for M&A",
    images: "https://parslai.com/images/product/landing_preview.png",
    url: "https://parslai.com",

  }

}


export default function HomePage() {



  return (
    <>
      <Head>
        <meta property="og:title" content="Home Page Title" />
        <meta property="og:description" content="Description of the home page." />
        <meta property="og:image" content="https://yourwebsite.com/path-to-your-home-thumbnail.jpg" />
        <meta property="og:url" content="https://yourwebsite.com/home" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home Page Title" />
        <meta name="twitter:description" content="Description of the home page." />
        <meta name="twitter:image" content="https://yourwebsite.com/path-to-your-home-thumbnail.jpg" />
      </Head>
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
              <Title order={1}>Make informed decisions in hours, not weeks</Title>
              <Grid
                gutter={"xl"}

              >

                <GridCol span={{ base: 12, md: 4 }}>
                  <Text mb={"sm"} size="xl">Beat out competition by making compelling offers faster and identifying lemons earlier.</Text>
                  <WaitlistSignup />
                </GridCol>
                <GridCol span={{ base: 12, md: 8 }}>

                  <Image
                    radius={"md"}
                    fit="fill"
                    // component={NextImage} 
                    width={750} height={500} src={"images/product/chart.png"} alt="My image"
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
                    fit="contain"
                    // component={NextImage} 
                    width={750} height={500} src={"images/product/contract_list.png"} alt="My image"
                    fallbackSrc="https://placehold.co/750x500?text=Example" />
                </GridCol>
                <GridCol span={{ base: 12, md: 4 }}>
                  <Text mb={"sm"} style={{ alignSelf: "flex-end" }} size="xl">Remove due diligence roadblocks and resolve red flags prior to handing contract review over to outside counsel.</Text>
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
              <Title order={1}>Mitigate risk with AI</Title>
              <Grid gutter={"xl"}>

                <GridCol span={{ base: 12, sm: 4 }}>
                  <Text mb={"sm"} size="xl">Merge the unique strengths of manual and AI automated due diligence for better accuracy.</Text>
                  <WaitlistSignup />
                </GridCol>
                <GridCol span={{ base: 12, sm: 8 }}>
                  <Image
                    radius={"md"}
                    fit="contain"
                    // component={NextImage} 
                    width={750} height={500} src={"images/product/formatter.png"} alt="Auto summarized and checked"
                    fallbackSrc="https://placehold.co/600x400?text=Placeholder" />
                </GridCol>
              </Grid>
            </Stack>



          </Container>
        </Box>

        <Divider />

        <Box py={60}>
          <Container size={"1200px"}>


            <Stack >
              <Title order={1}>Built for M&A professionals</Title>
              {/* <Grid gutter={"xl"}> */}

              {/* <GridCol span={{ base: 12, md: 4 }}> */}
              <Text mb={"sm"} size="xl">Seamless workflow integration, Auditable AI results, Enhanced purchase agreement negotiation, Supplemental request support, Team collaboration, and much more.</Text>
              <Group>

                <WaitlistSignup />
              </Group>
              {/* </GridCol> */}
              {/* <GridCol span={{ base: 12, md: 8 }}>
                
              </GridCol> */}
              {/* </Grid> */}
            </Stack>



          </Container>
        </Box>

        <Divider />


        <Box>

          <GridBackground y="100%" x="80%" />
          <Box mt={"10vh"} pb={"5vh"} >
            <Meteors />

            {/* <FrostedGlassSVG> */}
            <Container size={1260}>
              <Paper
                shadow="xl"
                p={"xl"}
                py={60}
                style={{ zIndex: 3 }}
                pos="relative"
                bg={"indigo.0"}
                radius={"md"}>


                <Title c="dark">Simple Pricing</Title>
                <Stack mt={"lg"} gap={"sm"} align="center" >
                  <Text
                    className={styles.priceTitle}

                    variant="gradient" gradient={{ from: 'blue.6', to: 'cyan.8', deg: 30 }}
                  >$1000/month + $0.50 per page</Text>
                  <Text size="xl" variant="gradient" gradient={{ from: 'blue.6', to: 'cyan.8', deg: 30 }}
                  >Annual plan, 1000 pages included every month</Text>

                </Stack>
              </Paper>
            </Container>
            {/* </FrostedGlassSVG> */}
          </Box>


          <Box pt={"10vh"} pb={"15vh"} pos={"relative"}>

            <Container size={1200} style={{ zIndex: 2 }} pos={"relative"}>
              <Stack gap={"sm"} align="center">

                <Title style={{ alignSelf: "flex-start" }} mb={"sm"} >Parsl in action</Title>
                <div
                  className={styles.videoContainer}

                >
                  <iframe
                    // width="560" height="315"
                    className={styles.videoIframe}
                    src="https://www.youtube.com/embed/PlgKMQCawaM?si=kXJcVckA78rEfQhJ"
                    // width="100%"
                    // height="100%"
                    title="Parsl Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen></iframe>
                </div>

              </Stack>
            </Container>
          </Box>
        </Box>


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
    </>
  )
}




