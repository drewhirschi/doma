import { Anchor, Box, Center, Container, Grid, GridCol, Group, Image, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import LoginButton from "./LoginButton";
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
    <Box style={{ overflow: 'hidden', scrollBehavior: "smooth" }} miw={350}>

      <Image src="/logo.svg" alt="Parsl logo" height={900} style={{ position: "absolute" }} />
      <Group justify="flex-end"><LoginButton /></Group>
      <Container >
        <Center h={832}>
          <Stack align="center" maw={700}>

            <Title style={{ textAlign: 'center' }} size={64}>Parsl</Title>
            <Text style={{ textAlign: 'center' }} size="xl">Accurate Legal Due Diligence for Technology Focused M&A</Text>
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

            <Title>Optimize you time</Title>
            <Text size="xl">Parsl automates common tedious tasks so you and your team only need to spend time and resources on the rare edge cases that require a human touch.</Text>
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


      <Box py={60} bg={"dark.7"} c={"white"}>
        <Container className={classes.responsiveContainer}>


          <Stack >
            <Title order={3}>Get critical results in record speed</Title>

            <Text size="xl">Parsl revolutionizes turnaround times by delivering a comprehensive and actionable issue analysis within 24 hours. Gain the upper hand in setting the terms of the deal by identifying and solving issues early.</Text>
          </Stack>



        </Container>
      </Box>

      <Box py={60} bg={"#1382B2"} c={"white"}>
        <Container className={classes.responsiveContainer}>

          <SimpleGrid spacing={"xl"} cols={{ sm: 2 }}>


            <Image src="/images/product/agreement_view.png" alt="frustrated lawyers" h={260} fit="contain" />
            <Stack >
              <Title order={3}>Achieve better outcomes by doing less</Title>

              <Text size="xl">Achieve higher accuracy in finding key information by merging the unique strengths of manual and automated review by performing AI-assisted due diligence. With Parsl it has never been easier to verify AI results. All decisions are provided with linked references to the original contract language from which AI decisions were made. Understand and confirm the logic with a click of a mouse.</Text>
            </Stack>



          </SimpleGrid>
        </Container>
      </Box>
      <Box py={60} >
        <Container className={classes.responsiveContainer}>


          <Stack >
            <Title order={3}>Enhanced purchase agreement drafting and negotiation</Title>

            <Text size="xl">Easily access granular contract data to auto generate disclosure schedules, inform your purchase agreement drafting, and negotiate with data on your side.</Text>
          </Stack>



        </Container>
      </Box>
      <Box bg={"dark.7"} py={60} c="white">
        <Container className={classes.responsiveContainer}>

          <SimpleGrid spacing={"xl"} cols={{ sm: 2 }}>


            <Image src="/images/product/project_home.jpg" alt="Project home view" h={260} fit="contain" />
            <Stack >
              <Title order={3}>Streamline your team’s process from end-to-end</Title>

              <Text size="xl">Increase efficiency and streamline communication using an all-in-one platform. Whether you’re reviewing by yourself, or managing dozens of others, Parsl makes it easy. Assign documents to reviewers, manage supplemental requests, escalate problems, and much more.</Text>
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
        <div>

          For questions or comments, please email <Anchor href="mailto:ezra@parslai.com">ezra@parslai.com</Anchor>
        </div>
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




