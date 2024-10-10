import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";

import { actionWithNotification } from "@/ux/clientComp";
import { updateCompanyLinkedinProfile } from "./actions";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

interface Props {
  liProfile: LinkedInProfile_SB | undefined | null;
  company: CompanyProfile_SB;
}
export function ChangeLinkedInProfileModal(props: Props) {
  const [opened, { open, close }] = useDisclosure(false);

  const baseCompanyUrl = "https://www.linkedin.com/company/";
  const form = useForm({
    initialValues: {
      url: "",
    },
    validate: {
      url: (value) => {
        if (!value) {
          return "URL is required";
        } else if (!value.startsWith(baseCompanyUrl)) {
          return "Must start with " + baseCompanyUrl;
        } else if (value.length <= baseCompanyUrl.length) {
          return "No company in URL";
        }
        return null;
      },
    },
  });

  return (
    <>
      <Modal
        size={"lg"}
        opened={opened}
        onClose={close}
        title="Change LinkedIn Profile"
      >
        <Stack>
          <TextInput
            label="LinkedIn Company URL"
            placeholder={props.liProfile?.url ?? baseCompanyUrl}
            {...form.getInputProps("url")}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={!form.isDirty()}
              onClick={() => {
                const formValidation = form.validate();

                if (!formValidation.hasErrors) {
                  actionWithNotification(async () => {
                    await updateCompanyLinkedinProfile(
                      props.company,
                      form.values.url,
                    );
                  });
                }
              }}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Button size="compact-sm" variant="default" onClick={open}>
        Change
      </Button>
    </>
  );
}
