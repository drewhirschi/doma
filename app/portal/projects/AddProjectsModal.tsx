"use client"

import { Box, Button, Group, Modal, MultiSelect, Select, TagsInput, TextInput, rem } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { useEffect, useState } from 'react';

import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { browserClient } from '@/supabase/BrowserClient';
import { createProject } from './AddProjectModal.action';
import { useDisclosure } from '@mantine/hooks';

interface Props {
  users: Profile_SB[]
  projects: (Project_SB & { profile: Profile_SB[], contract: { completed: boolean }[] })[]
}

export interface CreateFormValues {
  projectName: string,
  assignedAttorneys: string[],
  dealStructure: string,
  client: string,
  counterparty: string,
  targetNames: string,
  phaseDeadline: Date
}

export function AddProjectsModal(props: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [value, setValue] = useState<Date | null>(null);
  const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
  const supabase = browserClient()

  const uniqueNames = new Set(props.projects.map((d) => d.display_name));

  const today = new Date();
  const nextWeek = new Date(today);

  nextWeek.setDate(today.getDate() + 7);

  const form = useForm({
    initialValues: {
      projectName: '',
      assignedAttorneys: [],
      dealStructure: '',
      client: '',
      counterparty: '',
      targetNames: '',
      phaseDeadline: nextWeek // Set default to a week in the future
    },

    validate: {
      projectName: (value) =>
        uniqueNames.has(value) ? 'Project name already used' : !value ? 'Enter the project name' : null,
      dealStructure: isNotEmpty('Enter the deal structure'),
      client: isNotEmpty('Enter the client you are representing'),
      counterparty: (value, values) =>
        value == values.client ? 'Client and counterparty cannot be the same' : !value ? 'Enter the counterparty' : null,
      targetNames: isNotEmpty('Enter the company names the entity that is having due diligence performed on goes by')
    },
  });

  

  return (
    <>
      <Modal opened={opened} onClose={() => {
        close()
        form.reset()
      }} title="Authentication" closeOnClickOutside={false}>

        <Box component="form" maw={400} mx="auto" onSubmit={form.onSubmit((values) => {
          console.log("creating project")
          createProject(values).then(() => {
            close()
            form.reset()
          })
        })}>
          <TextInput label="Project Name" placeholder="Project name" withAsterisk {...form.getInputProps('projectName')} />
          <MultiSelect
            label="Assigned Attorneys"
            placeholder="Pick attorneys"
            checkIconPosition="right"
            data={props.users.map((u) => ({ value: u.id, label: u.display_name ?? u.email }))}
            clearable
            mt="md"
            nothingFoundMessage="Name not found..."
            {...form.getInputProps('assignedAttorneys')}
          />
          <Select
            label="Deal Structure"
            placeholder="Pick structure"
            data={['Asset Purchase', 'Stock Purchase', 'Reverse Triangle Merger', 'Forward Merger', 'Other']} // if other, add a text field to explain
            withAsterisk
            mt="md"
            {...form.getInputProps('dealStructure')}
          />
          <TextInput
            label="Your Client"
            placeholder="Your client"
            withAsterisk
            mt="md"
            {...form.getInputProps('client')}
          />
          <TextInput
            label="Counterparty"
            placeholder="Counterparty"
            withAsterisk
            mt="md"
            {...form.getInputProps('counterparty')}
          />
          <Select
            label="Target (all known names)"
            placeholder="Pick from list or type anything"
            data={[{ value: form.values.client + "_client", label: form.values.client }, { value: form.values.counterparty + "_counterparty", label: form.values.counterparty }].filter((d) => d.label)}
            mt="md"
            {...form.getInputProps('targetNames')}
          />
          <DatePickerInput
            label="Phase Deadline"
            placeholder="Pick date"
            leftSection={icon}
            mt="md"
            leftSectionPointerEvents="none"
            clearable
            {...form.getInputProps('phaseDeadline')}
          />


          <Group justify="flex-end" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </Box>


      </Modal>

      <Button onClick={open}>New</Button>
    </>
  );
}