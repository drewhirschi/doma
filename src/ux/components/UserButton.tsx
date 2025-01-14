"use client";

import {
  Avatar,
  Box,
  Flex,
  Group,
  MantineSize,
  Menu,
  Popover,
  Text,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconChevronRight,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { Session } from "@supabase/supabase-js";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import classes from "./UserButton.module.css";
import { getInitials } from "@/ux/helper";
import { useRouter } from "next/navigation";

export function UserButton({ collapsed }: { collapsed?: boolean }) {
  const supabase = browserClient();

  const router = useRouter();

  const [profile, setProfile] = useState<
    (Profile_SB & { tenant: Tenant_SB | null }) | null | undefined
  >(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
      }
      if (data.session) {
        const profileQ = await supabase
          .from("profile")
          .select("*, tenant(*)")
          .eq("id", data.session.user.id)
          .single();
        setProfile(profileQ.data);
      }
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const userAvatar = (size: MantineSize = "md") => (
    <Avatar
      size={size}
      //src={session?.user?.user_metadata?.avatar_url} // implement for images
      color={profile?.color ?? "black"} // need to add color to the user_metadata or retrieve profile
      radius="xl"
    >
      {getInitials(profile?.display_name ?? "")}
    </Avatar>
  );

  return (
    <Menu shadow="md" width={200} withinPortal={true}>
      <Menu.Target>
        <UnstyledButton className={classes.user} mx={4}>
          <Flex wrap={"nowrap"} direction={"row"} align={"center"}>
            {userAvatar()}

            {!collapsed && (
              <>
                <Box style={{ flex: 1, maxWidth: 120 }} ml={"sm"}>
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile?.display_name ?? ""}
                  </Text>

                  <Text
                    c="dimmed"
                    size="xs"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile?.email ?? ""}
                  </Text>
                </Box>

                <IconChevronRight
                  style={{ width: rem(14), height: rem(14) }}
                  stroke={1.5}
                />
              </>
            )}
          </Flex>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          href={"/portal/team"}
          leftSection={
            <Avatar size={"sm"} color={profile?.color ?? "black"} radius="xs">
              {getInitials(profile?.tenant?.name ?? "")}
            </Avatar>
          }
        >
          {profile?.tenant?.name}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          component={Link}
          href={"/portal/settings"}
          leftSection={userAvatar("sm")}
        >
          {profile?.email}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          component={Link}
          href={"/portal/settings"}
          leftSection={
            <IconSettings style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Settings
        </Menu.Item>
        <Menu.Item
          onClick={handleSignOut}
          color="red"
          leftSection={
            <IconLogout style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
