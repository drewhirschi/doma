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
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  Icon24Hours,
  IconBook,
  IconDatabase,
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

const navbarConfig = [
  {
    label: "Projects",
    path: "projects",
    icon: <IconSubtask />,
  },
  {
    label: "Companies",
    path: "companies",
    icon: <IconSearch />,
  },
  {
    label: "Search",
    path: "search",
    icon: <IconSearch />,
  },
  {
    label: "Team",
    path: "team",
    icon: <IconUsersGroup size={26} />,
  },
  {},
];

export function NavBar() {
  const pathname = usePathname();
  // const { hovered: navbarHovered, ref: navbarRef } = useHover();

  return (
    <Stack
      // ref={navbarRef}
      className={classnames.navbar}
    >
      <div className={classnames["nav-item"]}>
        {navbarConfig.map((item) => (
          <NavLink
            key={item.label}
            href={`/portal/${item.path}`}
            label={
              <Tooltip position="right" label={item.label}>
                <Box>{item.icon}</Box>
              </Tooltip>
            }
            component={Link}
            active={pathname.split("/")[2] === item.path}
          />
        ))}
      </div>

      <div className={classnames["nav-item"]}>
        <UserButton collapsed={true} />
      </div>
    </Stack>
  );
}
