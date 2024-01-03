'use client'

import { Avatar, Group, Menu, Popover, Text, UnstyledButton, rem } from '@mantine/core';
import { IconChevronRight, IconLogout, } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { Session } from '@supabase/supabase-js';
import { browserClient } from '@/supabase/BrowerClients';
import classes from './UserButton.module.css';
import { useRouter } from 'next/navigation';

export function UserButton({ collapsed }: { collapsed?: boolean }) {


  const supabase = browserClient();

  const router = useRouter();

  const [session, setSession] = useState<Session | null | undefined>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
      }
      if (data.session) {
        setSession(data.session)
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
              src={session?.user?.user_metadata?.avatar_url}
              radius="xl"
            />

            {!collapsed && <>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {session?.user?.user_metadata.name ?? ""}
                </Text>

                <Text c="dimmed" size="xs">
                  {session?.user?.email ?? ""}
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