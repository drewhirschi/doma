import { ActionIcon, Button, Menu, Text, rem } from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";

import { actionWithNotification } from "@/ux/clientComp";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { deleteLogo } from "./actions";

interface Props {
  logo: CompanyLogo_SB;
}
export function LogosMeun(props: Props) {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="default">
          <IconDotsVertical
            style={{ width: "70%", height: "70%" }}
            stroke={1.5}
          />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {/* <Menu.Divider /> */}

        <Menu.Item
          color="red"
          leftSection={
            <IconTrash style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={async () => {
            const sb = browserClient();

            await actionWithNotification(async () => {
              await deleteLogo(props.logo);
            });
          }}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
