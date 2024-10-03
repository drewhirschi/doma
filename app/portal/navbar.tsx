"use client";

import {
  Anchor,
  AppShell,
  Box,
  Breadcrumbs,
  Code,
  Flex,
  Group,
  NavLink,
  ScrollArea,
  Space,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  Icon24Hours,
  IconBook,
  IconFolderOpen,
  IconSearch,
  IconSubtask,
  IconUsersGroup,
} from "@tabler/icons-react";

import Link from "next/link";
import { UserButton } from "@/ux/components/UserButton";
import classnames from "./layout.module.css";
import { useHover } from "@mantine/hooks";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  // const { hovered: navbarHovered, ref: navbarRef } = useHover();

  return (
    <Stack
      // ref={navbarRef}
      className={classnames.navbar}
    >
      <div className={classnames["nav-item"]}>
        <NavLink
          href={`/portal/projects`}
          label={<IconSubtask />}
          component={Link}
          active={pathname.split("/")[2] === "projects"}
        />
        <NavLink
          href={`/portal/companies`}
          label={<IconSearch />}
          component={Link}
          active={pathname.split("/")[2] === "companies"}
        />
        {/* <NavLink
          href={`/portal/team`}
          label={<IconUsersGroup />}
          component={Link}
          active={pathname.split("/")[2] === "team"}
        /> */}
        {/* <NavLink
          href={`/portal/reports`}
          label={<IconBook />}
          component={Link}
          active={pathname.split("/")[2] === "reports"}
        /> */}
      </div>

      <div className={classnames["nav-item"]}>
        <UserButton collapsed={true} />
      </div>
    </Stack>
  );
}
