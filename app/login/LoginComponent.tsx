"use client";

import {
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Stack,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconLogin2, IconPhoto } from "@tabler/icons-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import GoogleButton from "./GoogleButton";
import MicrosoftButton from "./MicrosoftButton";
import { browserClient } from "@/ux/supabase-client/BrowserClient";

function PasswordLoginForm() {
  const supabase = browserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  return (
    <Box maw={300} mx="auto">
      <TextInput
        label="Email"
        placeholder="Your email"
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
      />
      <TextInput
        label="Password"
        placeholder="Your password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
      />
      <Group justify="flex-end" mt="md">
        <Button
          onClick={async () => {
            const result = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (result.error) {
              console.log(result.error);
            } else {
              router.push("/portal/projects");
            }
          }}
        >
          Log in
        </Button>
      </Group>
    </Box>
  );
}

export default function Login() {
  const supabase = browserClient();
  const searchParams = useSearchParams();

  let nextUrl;
  if (searchParams.get("next")) {
    nextUrl = searchParams.get("next");
  }

  let origin = "";
  if (typeof window !== "undefined") {
    origin = window.location.origin;
  }

  const authCallbackUrl = `${origin}/auth/callback${nextUrl ? `?next=${nextUrl}` : ""}`;

  return (
    <Center h={"100vh"}>
      <Paper shadow="sm" p="lg" bg={"gray.0"}>
        <Stack>
          <Group>
            <ThemeIcon variant="light">
              <IconLogin2 style={{ width: "70%", height: "70%" }} />
            </ThemeIcon>
            <Title order={2}>Login to Doma</Title>
          </Group>

          <Stack>
            <MicrosoftButton authCallbackUrl={authCallbackUrl} />
            <GoogleButton authCallbackUrl={authCallbackUrl} />
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
}
