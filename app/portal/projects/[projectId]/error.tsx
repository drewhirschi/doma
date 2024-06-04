'use client' // Error components must be Client Components

import { Button, Group, Stack } from '@mantine/core'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Stack
      w={"none"}>
      <h2>Something went wrong!</h2>
      {error.message}
      <Group>

        <Button
        variant='default'
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
        <Button component={Link} href={'/portal/projects'}>Back to projects</Button>
      </Group>
    </Stack>
  )
}