'use client'

import { Avatar, Group, Menu, Popover, Text, UnstyledButton, rem } from '@mantine/core';
import { IconChevronRight, IconLogout, } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { Session } from '@supabase/supabase-js';
import { browserClient } from '@/supabase/BrowerClients';
import classes from './UserButton.module.css';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/helper';

export function UserButton({ collapsed }: { collapsed?: boolean }) {


  const supabase = browserClient();

  const router = useRouter();

  const [profile, setProfile] = useState<Profile_SB | null | undefined>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
      }
      if (data.session) {
        const profileQ = await supabase.from("profile").select("*").eq("id", data.session.user.id).single()
        setProfile(profileQ.data)
      }
    })

  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (

    <Menu shadow="md" width={"target"}>
      <Menu.Target>
        <UnstyledButton className={classes.user} mx={4}>
          <Group>
            <Avatar
              //src={session?.user?.user_metadata?.avatar_url} // implement for images
              color={profile?.color ?? "black"} // need to add color to the user_metadata or retrieve profile
              radius="xl"
            >{getInitials(profile?.display_name ?? "")}</Avatar>

            {!collapsed && <>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {profile?.display_name ?? ""}
                </Text>

                <Text c="dimmed" size="xs">
                  {profile?.email ?? ""}
                </Text>
              </div>

              <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
            </>}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {/* <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
          Settings
        </Menu.Item>
        <Menu.Divider /> */}
        <Menu.Item
          onClick={handleSignOut}
          color="red"
          leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>

  );
}