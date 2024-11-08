"use client";

import { Button, Modal, TextInput } from "@mantine/core";

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
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={close} title="Invite a team member">
        <TextInput label="Email" required {...form.getInputProps("email")} />
        <TextInput label="Name" required {...form.getInputProps("name")} />
        {/* <TeamRoleSelect defaultValue={form.values.role} withLabel /> */}
        <Button
          loading={loading}
          mt="sm"
          onClick={async () => {
            setLoading(true);

            await actionWithNotification(
              async () => {
                await createProfile(form.values);
              },
              {
                title: "Creating invite",
                errorMessage: "Failed to invite " + form.values.email,
                successMessage: "Invited " + form.values.email,
              },
            );

            setLoading(false);
            form.reset();
            close();
          }}
        >
          Invite
        </Button>
      </Modal>

      <Button onClick={open} mr={"sm"}>
        Invite a team member
      </Button>
    </>
  );
}
