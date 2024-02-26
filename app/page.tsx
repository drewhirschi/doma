import { Anchor, AspectRatio, Box, Button, Center, Checkbox, Container, Group, Image, SimpleGrid, Space, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";

import Link from "next/link";
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
      <Group justify="flex-end"><Button m={"md"} href="/login" component={Link} variant="subtle">Login</Button></Group>
      <Container >
        <Center h={832}>
          <Stack>
            <Title>Welcome to Parsl</Title>
            <Group justify="center">
              <Button component={Link} href={"#schedule"} scroll>
                Join the waitlist
              </Button>
              {/* <Button variant="outline" href={"#schedule"} component={Link}>
                Learn more
              </Button> */}
            </Group>
          </Stack>
        </Center>
      </Container>

      <Box mb={"xl"} py={60} bg={"dark.7"} mih={500} c={"white"}>
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
      </Box>

      <WaitlistSignup submitForm={async (values) => {
        "use server"


        await axios.post("https://submit-form.com/IkZtiKU2d", {
          method: "POST",
          body: values,
        })

      }} />

      <Box bg={"dark.7"} mih={500} c={"white"}>

        <Container py={60}>
          <Title>How does Parsl...</Title>
          <SimpleGrid mt={"xl"} spacing={"xl"} cols={{ base: 1, sm: 2 }}>
            <DescriptionItem
              header="Save time?"
              text="Parsl will boost productivity by saving time performing  manual data entry, reducing your chances of missing important deal information, and allowing you to begin working on the final work product before the manual review is complete. "
            />
            <DescriptionItem
              header="Give me peace of mind?"
              text="The speed at which AI is progressing is unparalleled.  AI is and continue to dramatically alter the legal industry. We want you to focus on what you do best, delivering quality legal advice. Let us take care of keeping up with all the most recent advances in AI and making sure that you are always using the best LLMs available. "
            />
            <DescriptionItem
              header="Assist me from start to finish?"
              text="Unlike other tools that stop providing value after pinpointing deal specific agreement language Parsl begins due diligence with the end in mind. Parsl focuses on the end result and works backwards to understand what information needs to be extracted for your final work product. "
            />
            <DescriptionItem
              header="Put me first?"
              text="At Parsl you are are highest priority and we love to hear from you. Feel free to contact us through the form on this website and we will do our best to get back to you as soon as possible. Our responsiveness is unbeatable in the industry."
            />
          </SimpleGrid>
          <Group justify="center" mt={150}>© 2024 Atlas Technology LLC. All rights reserved.</Group>
        </Container>
      </Box>


    </Box>
  )
}




