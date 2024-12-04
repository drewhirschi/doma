import { Button, Group, Modal, Text } from "@mantine/core";

import { LoadingState } from "@/shared/types/loadingstate";
import { actionWithNotification } from "@/ux/clientComp";
import { removeCompaniesFromProject } from "./actions";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

interface RemoveCompaniesDialogProps {
  selectedCompanies: number[];
  projectId: number;
  onRemoveSuccess: () => void;
}

export function RemoveCompaniesDialog({ selectedCompanies, projectId, onRemoveSuccess }: RemoveCompaniesDialogProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [removeLoading, setRemoveLoading] = useState<LoadingState>(LoadingState.IDLE);

  return (
    <>
      <Button onClick={open} color="red" disabled={selectedCompanies.length === 0} variant="subtle" mr="md" mt="md">
        Remove Selected
      </Button>

      <Modal opened={opened} onClose={close} title="Remove Companies">
        <Text>Are you sure you want to remove these companies from this project?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={close} radius="sm" gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={async () => {
              actionWithNotification(() => removeCompaniesFromProject(Number(projectId), selectedCompanies));
              close();
            }}
            loading={removeLoading === LoadingState.LOADING}
            radius="sm"
            variant="gradient"
            gradient={{ deg: 30, from: "red.8", to: "red.6" }}
          >
            Remove
          </Button>
        </Group>
      </Modal>
    </>
  );
}
