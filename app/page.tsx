import { Box, Center, Container, Stack, Text, Title } from "@mantine/core";

import GridBackground from "@/ux/components/GridBackground";
import { Metadata } from "next";
import { Meteors } from "@/ux/components/Meteors";
import TopNav from "./TopNav";
import { WaitlistSignup } from "./WaitlistSignup";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Doma",
  description: "",
  keywords: "Doma, Company data, AI company data, AI insights",
  authors: { name: "Doma Data", url: "https://domadata.com" },
  openGraph: {
    type: "website",
    title: "Doma",
    description: "Automated Market Reports",
    images: "https://domadata.com/images/product/landing_preview.png",
    url: "https://domadata.com",
  },
};

export default function HomePage() {
  return (
    <Box
      style={{ overflow: "hidden", scrollBehavior: "smooth" }}
      h={"100vh"}
      miw={350}
      c={"gray.8"}
      className={styles.landingPageContainer}
    >
      <TopNav />

      <div style={{ position: "relative", height: "100%" }}>
        <GridBackground />
        <Meteors />

        <Container h={"100%"} style={{ zIndex: 2, position: "relative" }}>
          <Center h={"90%"}>
            <Stack align="center" maw={720} gap={"xl"}>
              <Title order={1} ta={"center"}>
                Struggling to keep your leads warm?
              </Title>
              <Text size={"20px"} ta={"center"} fw={500}>
                Our AI makes drafting quarterly, seller-specific reports
                seamless to ensure your valuable leads stay active and
                interested
              </Text>
              <WaitlistSignup
                callToAction="Book a Demo"
                secondaryDesription="We'll contact you to schedule a 20-minute introductory call."
              />
            </Stack>
          </Center>
        </Container>
      </div>
    </Box>
  );
}
