"use client";

import {
  Anchor,
  Box,
  Button,
  Divider,
  Group,
  NavLink,
  TabsList,
  TabsTab,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconMessageCircle,
  IconPhoto,
  IconSettings,
} from "@tabler/icons-react";
import { Tabs, rem } from "@mantine/core";

import Link from "next/link";
import LoginButton from "../../../app/LoginButton";
import React from "react";
import classes from "./TopNav.module.css";
import { usePathname } from "next/navigation";

interface ITopNavProps {}

// function CenterNavButton({}) {
//     return (

//         <UnstyledButton component={Link} href="/projects" ></UnstyledButton>
//     )
// }

export default function TopNav() {
  const iconStyle = { width: rem(12), height: rem(12) };
  const pathname = usePathname();
  console.log(pathname);

  return (
    <>
      <Group justify="space-between" h={66}>
        {/* <div className={classes.neonline}></div> */}
        <Text
          ml={"md"}
          style={{ fontWeight: 400, fontSize: 42 }}
          variant="gradient"
          gradient={{ from: "dark.8", to: "dark.3", deg: -45 }}
        >
          Parsl
        </Text>

        <Group gap={48} justify="space-between" h={"100%"}>
          <Box
            mod={{ active: pathname === "/" }}
            className={classes.root}
            key={"home"}
            href="/"
            component={Link}
          >
            Home
          </Box>

          <Box
            mod={{ active: pathname.startsWith("/blog") }}
            className={classes.root}
            component={Link}
            key={"blog"}
            href="/blog"
          >
            Blog
          </Box>
        </Group>

        <LoginButton />
      </Group>
      <Divider />
    </>
  );
}
