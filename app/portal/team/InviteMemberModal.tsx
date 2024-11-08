"use client";

import { Button, Modal, Select, TextInput } from "@mantine/core";
import { createProfile } from "./InviteMemberModal.action";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { actionWithNotification } from "@/ux/clientComp";

export interface CreateProfileValues {
  email: string;
  role: string;
  name: string;
}

export function InviteMemberModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      role: "associate",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      name: (value) => (value.trim() ? null : "Name is required"),
    },
  });

  const handleInvite = async () => {
    if (!form.isValid()) {
      form.validate();
      return;
    }

    setLoading(true);
    await createProfile(form.values);
    setLoading(false);

    form.reset();
    close();
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Invite a team member">
        <TextInput label="Email" required {...form.getInputProps("email")} />
        <TextInput label="Name" required {...form.getInputProps("name")} />
        <Button
          loading={loading}
          mt="sm"
          onClick={handleInvite}
          radius="sm"
          variant="gradient"
          gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
        >
          Invite
        </Button>
      </Modal>

      <Button
        onClick={open}
        radius="sm"
        variant="gradient"
        gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
        mr="sm"
      >
        Invite a team member
      </Button>
    </>
  );
}
