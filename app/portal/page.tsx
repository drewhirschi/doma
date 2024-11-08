"use client";

import { Button, Center, Stack, Title } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function PortalPage() {
  const router = useRouter();

  return (
    <Center style={{ height: "100vh" }}>
      <Stack align="center">
        <Title order={2}>Portal</Title>
        <Button variant="default" onClick={() => router.push("/portal/projects")}>
          Go to Projects
        </Button>
        <Button variant="default" onClick={() => router.push("/portal/companies")}>
          Go to Companies
        </Button>
      </Stack>
    </Center>
  );
}
