import { Anchor, AspectRatio, Box, Button, Center, Checkbox, Container, Grid, GridCol, Group, Image, SimpleGrid, Space, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";

import Link from "next/link";
import LoginButton from "./LoginButton";
import { ReactNode } from "react";
import { WaitlistSignup } from "./WaitlistSignup";
import axios from "axios";
import classes from './page.module.css';
import { pixel } from "@/utils";
import { redirect } from "next/navigation";

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
    <Box style={{ overflow: 'hidden', scrollBehavior: "smooth" }} miw={350}>

      <Image src="/logo.svg" alt="Parsl logo" height={900} style={{ position: "absolute" }} />
      <Group justify="flex-end"><LoginButton /></Group>
      <Container >
        <Center h={832}>
          <Stack align="center" maw={700}>

            <Title style={{ textAlign: 'center' }} size={64}>An AI-Powered Legal M&A Platform</Title>
            <Text style={{ textAlign: 'center' }} size="xl">Parsl automates processes all the way from document intake to purchase agreement drafting.</Text>
            <WaitlistSignup
              buttonText="Join the Waitlist"
              inputWidth={360}
            />

          </Stack>
        </Center>
      </Container>

      <Box py={60} bg={"#1382B2"} mih={500} c={"white"}>
        <Container>
          <Stack gap={"sm"} align="center">

            <Title >Achieve better outcomes, faster.</Title>
            <Text size="xl">Parsl gets the small stuff out of the way so that you can focus on adding strategic value.</Text>
            {/* <div style={{ maxWidth: 640 }}>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                <iframe src="https://dnjsol-my.sharepoint.com/personal/ezra_parslai_com/_layouts/15/embed.aspx?UniqueId=5c3e33f0-1ab8-4328-8da5-72fdbcc2daed&embed=%7B%22hvm%22%3Atrue%2C%22ust%22%3Atrue%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" 
                width="640" height="360" frameBorder="0" scrolling="no" allowFullScreen title="Parsl Demo 3.14.2024.mp4" 
                style={{ border: "none", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, height: '100%', maxWidth: "100%" }}>
                </iframe>
              </div>
            </div> */}
                {/* <iframe src="https://dnjsol-my.sharepoint.com/personal/ezra_parslai_com/_layouts/15/embed.aspx?UniqueId=5c3e33f0-1ab8-4328-8da5-72fdbcc2daed&embed=%7B%22hvm%22%3Atrue%2C%22ust%22%3Atrue%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" width="640" height="360" frameBorder="0" scrolling="no" allowFullScreen title="Parsl Demo 3.14.2024.mp4"></iframe> */}
                <iframe width="560" height="315" src="https://www.youtube.com/embed/vxgpUxApKV0?si=Jnh0JJBZSthPuYsn" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
          </Stack>
        </Container>
      </Box>


      <Box py={60} bg={"dark.7"} c={"white"}>
        <Container className={classes.responsiveContainer}>


          <Stack >
            <Title order={3}>Comprehensive due diligence report, done in hours not weeks</Title>

            <Text size="xl">Parsl revolutionizes turnaround times by allowing you to deliver actionable issue analysis to your clients within 24 hours, leaving clients impressed with your agility. Verify the auto generated due diligence report results by referencing the original contract language with a click of a mouse. </Text>
          </Stack>



        </Container>
      </Box>

      <Box py={60} >
        <Container className={classes.responsiveContainer}>

          <SimpleGrid spacing={"xl"} cols={{ sm: 2 }}>


            <Image src="/images/product/agreement_view.png" alt="frustrated lawyers" h={360} fit="contain" />
            <Stack >
              <Title order={3}>Second-level reviews, simplified</Title>

              <Text size="xl">Utilize AI to fly through the more tedious and painstaking aspects of M&A transactions, so your team can focus on more meaningful work — in return, decrease associate burnout and drive faster value for your firm.</Text>
            </Stack>



          </SimpleGrid>
        </Container>
      </Box>
      <Box py={60} bg={"#1382B2"} c={"white"}>
        <Container className={classes.responsiveContainer}>


          <Stack >
            <Title order={3}>Automatic disclosure schedules population, yes please</Title>

            <Text size="xl">Just upload the disclosure schedule and watch them auto populate with the required agreement information. Simply run a new search when changes are made and have the new results copied to your clipboard for quick use.</Text>
          </Stack>



        </Container>
      </Box>
      <Box bg={"dark.7"} py={60} c="white">
        <Container className={classes.responsiveContainer}>

          <SimpleGrid spacing={"xl"} cols={{ sm: 2 }}>


            <Image src="/images/product/project_home.jpg" alt="frustrated lawyers" h={300} fit="contain" />
            <Stack >
              <Title order={3}>Streamline your team’s process from end-to-end</Title>

              <Text size="xl">Whether you’re reviewing by yourself, or managing dozens of others, Parsl makes it easy. Assign documents to reviewers, manage supplemental requests, escalate problems, and much more.</Text>
            </Stack>



          </SimpleGrid>
        </Container>
      </Box>



      <Stack align="center" my={80}>

        <div>

          <Title>Get updates on our progress</Title>
          {/* <Text size="sm">Get updates on our progress</Text> */}
        </div>
        <WaitlistSignup
          buttonText="Join the Waitlist"
        />
      </Stack>

      <Box bg={"dark.7"} mih={500} c={"white"}>

        {/* <Container py={60}>
          <Title>How does Parsl...</Title>
          <SimpleGrid mt={"xl"} spacing={"xl"} cols={{ base: 1, sm: 2 }}>
            <DescriptionItem
              header="Raise profits?"
              text="Clients do not want to pay for inefficient first-pass due diligence or the required training, leading you to write off more hours than desired. Parsl leverages AI to prioritize the most important information, meaning you’re less likely to be spending (and writing off) hours spent on reviewing and searching for documents that don’t matter to the deal. This frees up you and your team to spend more time on deal strategy and deliver better client outcomes (the strongest and most straightforward way to grow profits) instead of justifying the time and effort spent, or worse, settling for write-offs."
            />
            <DescriptionItem
              header="Give verifiable results?"
              text="Parsl does not source results from generalized training data but bases results exclusively on the specific uploaded content. But just like any junior associate’s work it is important to confirm the accuracy of any work product. It has never been easier than with Parsl. No matter the result, with a single click you are taken to cold, hard agreement language that made up the building blocks to Parsl's legal analysis. You no longer need to ask the reviewer to “quickly” find the specific agreement and explain their reasoning to you."
            />
            <DescriptionItem
              header="Increase client satisfaction?"
              text="Parsl goes a step further than mere agreement language extraction by working directly with the client in order to keep them updated and keep the deal moving along. Wow clients with your predictability, accuracy, and ability to solve their issues faster (and typically with a lower cost than expected). Spend less time thinking about the process of due diligence and more time negotiating the purchase agreement."
            />
            <DescriptionItem
              header="Decrease burnout?"
              text="Just because you drowned in due diligence when you first got your license doesn’t mean your team should. Parsl sets your team up for success by utilizing AI to fly through the more tedious and painstaking aspects of M&A transactions, so they can focus on more meaningful work, and you can invest more time accelerating their learning — in return, drive faster value for your firm. By letting Parsl take the first pass the cognitive load of decision making is decreased and attorneys are able to save their energy for the more rare but important edge cases."
            />
          </SimpleGrid>
        </Container> */}


        <Grid py={"xl"} id="footer">
          <GridCol span={{ base: 12, md: 6 }}>
            <Group justify="center" >© 2024 Atlas Technology LLC. All rights reserved.</Group>
          </GridCol>
          <GridCol span={{ base: 12, md: 6 }}>
            <Stack justify="center" align="center">
              <Text fw={700}>Legal</Text>
              <Anchor href="/docs/privacy-policy.pdf">Privacy Policy</Anchor>
              <Anchor href="/docs/terms-of-use.pdf">Terms of Service</Anchor>
            </Stack>
          </GridCol>
        </Grid>
      </Box>



    </Box>
  )
}




