import { Button, Drawer } from "@mantine/core";

import { IconPencil } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

export function NewSectionDrawer() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="New Section"
        size={"lg"}
        position="right"
      >
        {/* Drawer content */}
      </Drawer>

      <Button
        onClick={open}
        leftSection={<IconPencil size={14} />}
        variant="subtle"
        color="dark"
        px={"xs"}
        mx={"xs"}
      >
        New Section
      </Button>
    </>
  );
}
