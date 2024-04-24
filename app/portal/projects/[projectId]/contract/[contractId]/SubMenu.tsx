import { Button, Menu, rem } from "@mantine/core";
import { IconMessageCircle, IconSettings } from "@tabler/icons-react";

export function SubMenu() {
    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Menu.Item>Toggle menu</Menu.Item>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                    Settings
                </Menu.Item>
                <Menu.Item leftSection={<IconMessageCircle style={{ width: rem(14), height: rem(14) }} />}>
                    Messages
                </Menu.Item>

            </Menu.Dropdown>
        </Menu>
    );
}