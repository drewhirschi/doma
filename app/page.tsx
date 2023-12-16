'use client'

import { ActionIcon, Button, Center, Container, Stack, TextInput, Title, rem } from "@mantine/core";
import { IconArrowRight, IconSearch } from '@tabler/icons-react';

import { useForm } from '@mantine/form';

export default function HomePage() {

  const form = useForm({
    initialValues: {
      link: "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
    },
    validate: {

    },
  });

  const onFormSubmit = form.onSubmit(async (values) => {
    // await fetchLink(values.link)
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onFormSubmit()
    }
  };

  return <Container >
    <Center h="90vh">
      <Stack w={600}  >
        <Title order={1}>Parsl</Title>
        <form onSubmit={onFormSubmit}>
          <TextInput
            {...form.getInputProps('link')}
            placeholder="https://target.com/contract"
            rightSection={(
              <ActionIcon size={32} radius="xl" variant="filled" type="submit">
                <IconArrowRight style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
              </ActionIcon>
            )}
            onKeyDown={handleKeyDown}
          />
        </form>
      </Stack>
    </Center>
  </Container>;
}


