"use client";

import { Divider, Group, Text } from "@mantine/core";

import LoginButton from "./LoginButton";
import React from "react";

export default function TopNav() {
  return (
    <>
      <Group justify="space-between" h={66}>
        <Text
          ml={"md"}
          style={{ fontWeight: 400, fontSize: 42 }}
          variant="gradient"
          gradient={{ from: "dark.8", to: "dark.3", deg: -45 }}
        >
          Doma
        </Text>

        <LoginButton />
      </Group>
      <Divider />
    </>
  );
}
