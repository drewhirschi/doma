import { Button, Modal, Stack } from '@mantine/core';

import { ReviewerCombobox } from '@/components/ReviewerCombobox';
import { browserClient } from '@/supabase/BrowerClients';
import { notifications } from '@mantine/notifications';
import { revalidatePath } from 'next/cache';
import { s } from 'vitest/dist/reporters-1evA5lom';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

interface Props {
  selectedRows: string[];
  members: Profile_SB[]
  pathname: string
}

export function AssignContractsModalButton({ selectedRows, members, pathname }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [memberId, setMemberId] = useState<string>("")

  return (
    <>
      <Modal  opened={opened} onClose={close} title="Assign">
        <Stack justify='space-between' mih={400}>

          <ReviewerCombobox projectMembers={members} handleUpdate={setMemberId} />

          <Button onClick={async () => {
            console.log(memberId)
            // get all contract ids
            const contractIds:string[] = []
            const sb = browserClient()
            try {
              await sb.from("contract").update({ assigned_to: memberId }).in("id", contractIds)
              revalidatePath(pathname)
            } catch (error) {
              console.error(error)
              notifications.show({
                title: "Error making assignment",
                message: "Please try again later.",
                color: "red"
              })
            }
            close()
          }}>Assign</Button>
        </Stack>
      </Modal>

      <Button disabled={selectedRows.length == 0} variant='default' onClick={open}>Assign</Button>
    </>
  );
}