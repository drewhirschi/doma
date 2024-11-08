"use client";

import { Box, Button, Group, Modal, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useState } from "react";
import { LoadingState } from "@/shared/types/loadingstate";
import { actionWithNotification } from "@/ux/clientComp";
import { createProject } from "./actions";
import { useDisclosure } from "@mantine/hooks";

interface Props {}

export function AddProjectModal(props: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [createLoading, setCreateLoading] = useState<LoadingState>(LoadingState.IDLE);

  const form = useForm({
    initialValues: {
      title: "",
    },
    validate: {
      title: isNotEmpty("Project name is required"),
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          form.reset();
        }}
        title="Start a New Project"
        closeOnClickOutside={true}
      >
        <Box maw={400} mx="auto">
          <TextInput label="Project Name" placeholder="Project name" withAsterisk {...form.getInputProps("title")} />

          <Group justify="flex-end" mt="md">
            <Button
              loading={createLoading == LoadingState.LOADING}
              disabled={!form.isValid()}
              radius="sm"
              variant="gradient"
              gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
              onClick={async () => {
                const values = form.values;
                setCreateLoading(LoadingState.LOADING);
                await actionWithNotification(() => createProject(values.title), {
                  successMessage: "Project created",
                  errorMessage: "Error creating project",
                  loadingMessage: "Creating project",
                });

                close();
                form.reset();
                setCreateLoading(LoadingState.IDLE);
              }}
            >
              Create
            </Button>
          </Group>
        </Box>
      </Modal>

      <Box mt="md" mr="md">
        <Button onClick={open} radius="sm" variant="gradient" gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}>
          New Project
        </Button>
      </Box>
    </>
  );
}
