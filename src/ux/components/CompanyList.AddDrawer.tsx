import { Box, Button, Drawer, Group, Paper, TextInput } from "@mantine/core";

import { actionWithNotification } from "../clientComp";
import { queueCompanyProfiling } from "../../../app/portal/companies/[cmpId]/overview/actions";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

export function AddCompanyDrawer() {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      url: "",
    },

    validate: {
      url: (value) => {
        const domainRegex =
          // /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
          /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:\/?#@!$&'()*+,;=]*)?$/;

        const isValidDomain = (url: string) => domainRegex.test(url);
        if (!isValidDomain(value)) {
          return "Invalid domain";
        }

        return null;
      },
    },
  });
  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        size="lg"
        position="right"
        title="Profile new company"
      >
        <Paper radius={8} withBorder p={"xs"}>
          <Box maw={600}>
            <Group align="flex-end" justify="space-between">
              <TextInput
                flex={1}
                label="Profile a company"
                description="Enter the URL of the company's website"
                placeholder="https://www.example.com"
                {...form.getInputProps("url")}
              />
              <Button
                onClick={async () => {
                  const validationRes = form.validate();

                  if (validationRes.hasErrors) {
                    return;
                  }

                  await actionWithNotification(async () => {
                    await queueCompanyProfiling(form.values.url);
                  });
                  form.reset();
                }}
              >
                Profile
              </Button>
            </Group>
          </Box>
        </Paper>
      </Drawer>

      <Button variant="default" size="compact-md" onClick={open}>
        Add company
      </Button>
    </>
  );
}
