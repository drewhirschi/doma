import { Button, Group, Text, Title } from "@mantine/core";
import {
  IconBrandGoogle,
  IconBrandGoogleFilled,
  IconBrandOffice,
} from "@tabler/icons-react";

import Link from "next/link";
import MetadataItem from "@/ux/components/MetadataItem";
import React from "react";
import { authUrl as microsoftAuthUrl } from "@/shared/oauth/microsoft";
import { serverClient } from "@/shared/supabase-client/server";

interface IpageProps {}

export default async function page() {
  const sb = serverClient();
  const userId = (await sb.auth.getUser()).data.user?.id;
  const { data: user, error: userErr } = await sb
    .from("profile")
    .select()
    .eq("id", userId!)
    .single();

  // const googleAuthUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/auth/callback/highlevel`)}&scope=${encodeURIComponent('contacts.write contacts.readonly conversations/message.readonly conversations.readonly locations.readonly')}&client_id=${process.env.HIGHLEVEL_CLIENT_ID}&state=${params.team}`

  return (
    <div>
      <h1>Settings</h1>
      {JSON.stringify(user)}
      <Group>
        <MetadataItem
          header="Name"
          text={user?.display_name ?? "Not set"}
          copyButton={false}
        />
        <MetadataItem
          header="Email"
          text={user?.email ?? "Not set"}
          copyButton={false}
        />
      </Group>

      <Title order={3}>Email</Title>
      {user?.send_email_provider ? (
        <Text>Signed in with {user.send_email_provider}</Text>
      ) : (
        <Group>
          <Button
            leftSection={<IconBrandOffice size={20} />}
            component={Link}
            href={microsoftAuthUrl()}
          >
            {" "}
            Sign into Microsoft
          </Button>
          {/* <Button leftSection={<IconBrandGoogleFilled size={20} />}
           component={Link}
           href={}> Sign into Google</Button> */}
        </Group>
      )}
    </div>
  );
}
