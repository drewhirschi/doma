"use client";

import { Box, NavLink, Stack, Tooltip } from "@mantine/core";
import { IconBuildingSkyscraper, IconSearch, IconSubtask, IconUsersGroup } from "@tabler/icons-react";

import Link from "next/link";
import { UserButton } from "@/ux/components/UserButton";
import classnames from "./layout.module.css";
import { usePathname } from "next/navigation";

const navbarConfig = [
  {
    label: "Projects",
    path: "projects",
    icon: <IconSubtask />,
  },
  {
    label: "Company Directory",
    path: "companies",
    icon: <IconBuildingSkyscraper />,
  },
  {
    label: "Search",
    path: "search",
    icon: <IconSearch />,
  },
  {
    label: "Team",
    path: "team",
    icon: <IconUsersGroup />,
  },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <Stack className={classnames.navbar}>
      <div className={classnames["nav-item"]}>
        {navbarConfig.map((item, idx) => (
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
