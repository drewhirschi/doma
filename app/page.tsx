import { Anchor, AspectRatio, Box, Button, Center, Checkbox, Container, Grid, GridCol, Group, Image, SimpleGrid, Space, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";

import Link from "next/link";
import LoginButton from "./LoginButton";
import { ReactNode } from "react";
import { WaitlistSignup } from "./WaitlistSignup";
import axios from "axios";
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

            <Title style={{ textAlign: 'center' }} size={64}>An AI Legal Assitant for M&A</Title>
            <Text style={{ textAlign: 'center' }} size="xl">Parsl helps along every step of the way from document intake to purchase agreement drafting.</Text>
            {/* <Group justify="center"> */}
              <WaitlistSignup
                buttonText="Join the waitlist"
                inputWidth={360}
              />
              {/* <Button variant="outline" href={"#schedule"} component={Link}>
                Learn more
              </Button> */}
            {/* </Group> */}
          </Stack>
        </Center>
      </Container>

      {/* <Box mb={"xl"} py={60} bg={"dark.7"} mih={500} c={"white"}>
        <Container>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>


            <Image src="/images/annica_and_patrick.png" alt="frustrated lawyers" h={300} fit="contain" />
            <Center h={300} >
              <Text maw={400} size="xl">Do you ever feel like Annica and Patrick who were just assigned a new batch of contracts to review from scratch?</Text>
            </Center>


            <Image fit="contain" src="/images/sarah_celebrating.png" alt="celebrating lawyer" h={300} />
            <Center h={300}>
              <Text maw={400} size="xl">Meet Sarah, who just used Parsl for the first time and was amazed to see that with the help of AI a first draft of her work product was complete before she even read a page!</Text>
            </Center>
          </SimpleGrid>
        </Container>
      </Box> */}

      {/* <Stack align="center" my={80}>

        <div>

          <Title>Join our waitlist!</Title>
          <Text size="sm">Get updates on our progress</Text>
        </div>
        <WaitlistSignup
          buttonText="Join"
        />
      </Stack> */}

      <Box bg={"dark.7"} mih={500} c={"white"}>

        <Container py={60}>
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
        </Container>


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




