"use client";

import { Box, Button, Divider, Group, Modal, SimpleGrid, Text, TextInput } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import axios from "axios";
import { fbPixel } from "@/ux/helper";
import { notifications } from "@mantine/notifications";
import { theme } from "../theme";
import { useForm } from "@mantine/form";

interface Props {
  callToAction?: string;
  secondaryDesription?: string;
}
export function WaitlistSignup({ callToAction, secondaryDesription }: Props) {
  const [opened, { open, close: closeModal }] = useDisclosure(false);
  const largeScreen = useMediaQuery(`(min-width: ${theme.breakpoints?.sm || 48}em)`);

  let pathname = "";
  if (typeof window !== "undefined") {
    pathname = window.location.pathname;
  }

  const form = useForm({
    initialValues: {
      email: "",
      first: "",
      last: "",
      title: "",
      company: "",
      url: pathname,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={closeModal}
        title={<Text fw={700}>{callToAction ?? "Join the Waitlist"}</Text>}
        size={largeScreen ? "lg" : "md"}
      >
        <form
          onSubmit={form.onSubmit(async (values) => {
            try {
              await axios.post("https://submit-form.com/IkZtiKU2d", {
                method: "POST",
                body: values,
              });
              fbPixel.event("WaitlistJoin");
              form.reset();
              closeModal();
              notifications.show({
                title: "Thank you!",
                message: "We'll be in touch soon.",
              });
            } catch (error) {
              notifications.show({
                title: "Error",
                message: "Something went wrong. Please try again later.",
                color: "red",
              });
            }
          })}
        >
          <Divider />

          <Text py={"sm"}>
            {!!secondaryDesription
              ? secondaryDesription
              : "As we have capacity, you can expect an email to schedule a get-to-know-you call."}
          </Text>

          <Box>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput {...form.getInputProps("first")} label="First Name" placeholder="First Name" />
              <TextInput {...form.getInputProps("last")} label="Last Name" placeholder="Last Name" />
              <TextInput {...form.getInputProps("email")} required label="Email" placeholder="Email" />
              <TextInput {...form.getInputProps("title")} label="Title" placeholder="Title" />
              <TextInput {...form.getInputProps("company")} label="Company" placeholder="Company" />
              <TextInput {...form.getInputProps("url")} label="Website" placeholder="URL" />
            </SimpleGrid>

            <Group justify="flex-end">
              <Button mt={"xl"} type="submit">
                Submit
              </Button>
            </Group>
          </Box>
        </form>
      </Modal>

      <Button onClick={open} size="lg" variant="gradient" gradient={{ deg: 30, from: "blue.8", to: "blue.6" }} fw={500}>
        {callToAction ?? "Join the Waitlist"}
      </Button>
    </>
  );
}
