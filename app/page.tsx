import { Anchor, Box, Center, Container, Divider, Grid, GridCol, Group, Image, List, ListItem, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import GridBackground from "@/components/GridBackground";
import Head from "next/head";
import LoginButton from "./LoginButton";
import { Metadata } from "next";
import { Meteors } from "@/components/Meteors";
import TopNav from "@/components/TopNav";
import { WaitlistSignup } from "./WaitlistSignup";
import styles, { } from './page.module.css';
import { theme } from "../theme";

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

const callToAction = "Free Trial"

  return (
    <>
      <Box style={{ overflow: 'hidden', scrollBehavior: "smooth" }} miw={350} c={"gray.8"} className={styles.landingPageContainer}>


        <TopNav />


        <div style={{ position: "relative" }}>
          <GridBackground />
          <Meteors />

          <Container style={{ zIndex: 2, position: "relative" }} >
            <Center h={"95vh"}>
              <Stack align="center" maw={800}>

                <Text style={{ textAlign: 'left', alignSelf: "flex-start", fontWeight: 400, fontSize: 64 }} variant="gradient" gradient={{ from: 'dark.8', to: 'dark.3', deg: -45 }}
                >Parsl</Text>
                <Title order={1} ta={"center"}>Drowning in M&A Documents?  We Can Help You Breathe.</Title>
                <WaitlistSignup callToAction={callToAction}/>

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
              <Title order={1}>Empowering M&A professionals</Title>
              <Grid
                gutter={"xl"}

              >

                <GridCol span={{ base: 12, md: 4 }}>
                  <Text mb={"sm"} size="xl">Parsl automates repetitive tasks like contract review, data extraction, and deal management so you can keep your head above water. This frees up valuable time to focus on higher-level tasks requiring strategic thinking and legal expertise.</Text>
                  <WaitlistSignup callToAction={callToAction} />
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
              <Title order={1}>M&A contract review is hard</Title>
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
                  <Text mb={"sm"} style={{ alignSelf: "flex-end" }} size="xl">M&A due diligence is ambiguous and often done by associates still in training. There’s a lot on the line and always a worry that crucial details might be overlooked in a sea of paperwork. Parsl utilizes AI to bring peace of mind by ensuring a thorough and standardized review process. Parsl increases confidence by catching potential issues early and enables review of documents that were before not feasible.</Text>
                  <WaitlistSignup callToAction={callToAction} />
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
              <Title order={1}>Stand out from the crowd</Title>
              <Grid gutter={"xl"}>

                <GridCol span={{ base: 12, sm: 4 }}>
                  <Text mb={"sm"} size="xl">The legal world is moving faster than it ever has and nobody wants to be left behind. Clients are looking for firms that are efficient, close deals fast, utilize technology enabled insights, and offer predictable pricing. With Parsl your M&A group will be at the forefront of the industry and in a prime position to provide your clients the value they want.</Text>
                  <WaitlistSignup callToAction={callToAction} />
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
              <Title order={1}>Parsl is unique</Title>
              <Text mb={"sm"} size="xl">No other AI platform is as purpose-built and easy to use for M&A as Parsl. Parsl goes beyond verbatim clause extraction by automating the backend work of interpreting and applying the clauses. The results are simple enough for nonlawyers to understand and are easily queried to make populating disclosure schedules seamless.</Text>
              <Group>
                <WaitlistSignup callToAction={callToAction} />
              </Group>
            </Stack>
          </Container>
        </Box>

        <Divider />
        <Box py={60}>
          <Container size={"1200px"}>
            <Stack >
              <Title order={1}>What integration risk?</Title>
              <Text mb={"sm"} size="xl">For early customers there will be zero setup or required training. Simply share a deal&apos;s data room permissions and receive a completed interactive due diligence chart in 24 hours. We will use Parsl on your behalf to smooth out the rough edges and cater it to your needs. Worried about AI accuracy? All results will be double checked by an attorney, like getting a lawyer at the price of a SaaS.</Text>
              <Group>
                <WaitlistSignup callToAction={callToAction} />
              </Group>
            </Stack>
          </Container>
        </Box>

        <Divider />
        <Box py={60}>
          <Container size={"1200px"}>
            <Stack >
              <Title order={1}>Security and privacy at the core</Title>
              <Text mb={"sm"} size="xl">Data security is our top priority. We implement industry-leading security practices to ensure the confidentiality, integrity, and availability of your information. Our measures include:
                <List p={"sm"}>
                  <ListItem>Encrypting data both in transit and at rest using robust encryption standards.</ListItem>
                  <ListItem>Conducting regular security audits and vulnerability assessments to identify and mitigate potential threats.</ListItem>
                  <ListItem>Enforcing Multi-factor authentication and role-based access control ensure that only authorized personnel can access sensitive information.</ListItem>
                  <ListItem>Continuous monitoring of our systems for suspicious activities to prevent breaches.</ListItem>
                </List>




              </Text>
              <Group>
                <WaitlistSignup callToAction={callToAction} />
              </Group>
            </Stack>
          </Container>
        </Box>

        <Divider />


        <Box pos={"relative"}>

          <GridBackground y="100%" x="80%" />
          {/* <Box mt={"10vh"} pb={"5vh"} >
            <Meteors />
 
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
          </Box> */}


          <Box pt={"10vh"} pb={"15vh"} pos={"relative"}>

            <Container size={1200} style={{ zIndex: 2 }} pos={"relative"}>
              <Stack gap={"sm"} align="center">
                <Title style={{ alignSelf: "flex-start" }} mb={"sm"} >Parsl in action</Title>
                <div
                  className={styles.videoContainer}
                >
                  <iframe
                    className={styles.videoIframe}
                    src="https://www.youtube.com/embed/PlgKMQCawaM?si=kXJcVckA78rEfQhJ"
                    title="Parsl Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen></iframe>
                </div>

              </Stack>
            </Container>
          </Box>
        </Box>


        <Box bg={"dark.7"} h={300} c={"white"}>
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




