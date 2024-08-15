'use client';

import { Button, Divider, Modal, Stack, Title } from '@mantine/core';
import React, { useState } from 'react';

import { useDisclosure } from '@mantine/hooks';

interface IReportEditorNavbarProps { }

const templates = [
    {
        name: "6 Pager",
        sections: [

        ]
    }
]

export default function ReportEditorNavbar() {
    const [state, setState] = useState();
    const [templatesModalopened, { open: openTemplatesModal, close: closeTemplatesModal }] = useDisclosure(false);

    return (
        <>
            <Stack>
                <Title order={4}>Report Editor</Title>
                <Divider />
                <Button variant='default' onClick={openTemplatesModal}>
                    Templates
                </Button>

            </Stack>
            <Modal
                opened={templatesModalopened}
                onClose={closeTemplatesModal}
                title="Templates"
                size={"xl"}
            >
                <Divider />
                {templates.map((template) => (

                    <Button
                        onClick={() => {}}
                        color="dark" 
                        size="xs"
                        variant='subtle' 
                        key={template.name}>
                        {template.name}
                    </Button>
                ))}
            </Modal>
        </>
    );
}