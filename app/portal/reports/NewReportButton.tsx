"use client";

import {
  Button,
  CloseButton,
  FileButton,
  Group,
  Modal,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { IconFileAnalytics, IconPlus } from "@tabler/icons-react";

import { Database } from "@/shared/types/supabase";
import { title } from "process";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

interface Props {
  onCreateReport: (
    title: string,
    industry: string,
    templateId?: number,
  ) => Promise<void>;
  templates: Database["public"]["Tables"]["report_templates"]["Row"][];
}

export function NewReportButton({ onCreateReport, templates }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      industry: "",
      title: "",
      pdfFile: null,
      template: -1,
    },

    validate: {
      title: (value) => (value.length > 0 ? null : "Title is required"),
      industry: (value) => (value.length > 0 ? null : "Industry is required"),
      // pdfFile: (value) => (value ? null : 'Report is required'),
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={close} title="New Report" size={"md"}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            try {
              await onCreateReport(
                values.title,
                values.industry,
                values.template > -1 ? values.template : undefined,
              );
            } catch (error) {
              console.log(error);
            }
            form.reset();
            close();
          })}
        >
          <TextInput
            withAsterisk
            label="Title"
            placeholder="2023 Aerospace Trends"
            {...form.getInputProps("title")}
          />
          <TextInput
            withAsterisk
            label="Industry"
            placeholder="Aerospace"
            {...form.getInputProps("industry")}
          />
          <Select
            label="Template"
            data={templates.map((t) => ({
              value: String(t.id),
              label: t.display_name ?? "No name",
            }))}
            value={
              form.values.template >= 0 ? String(form.values.template) : null
            }
            onChange={(_value, option) =>
              form.setFieldValue("template", Number(option.value))
            }
          />

          {/* <FileButton

                        {...form.getInputProps('pdfFile')}
                        //  onChange={setFile}
                        accept="application/pdf,image/jpeg,image/png">
                        {(props) =>
                            <Group>

                                <Button
                                    leftSection={<IconFileAnalytics />}
                                    mt={"sm"} {...props} >Add report</Button>
                                {form.values.pdfFile && (
                                    <Group>

                                        <Text size="sm" ta="center" mt="sm">
                                            {form.values.pdfFile.name!}
                                        </Text>
                                        <CloseButton 
                                        onClick={() => form.setFieldValue('pdfFile', null)}
                                        />
                                    </Group>
                                )}
                            </Group>
                        }
                    </FileButton> */}

          <Group justify="flex-end" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Modal>

      <Button rightSection={<IconPlus />} onClick={open}>
        New
      </Button>
    </>
  );
}
