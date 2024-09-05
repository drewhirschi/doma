import { Button, Modal } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

export function CreateOutlineModal({hasOutline}: {hasOutline: boolean}) {
    const [opened, { open, close }] = useDisclosure(hasOutline);

    return (
        <>
            <Modal opened={opened} onClose={close} title="Create an Outline">
               
            </Modal>

        </>
    );
}