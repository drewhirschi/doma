'use client';

import { Button, Group, Stack, Textarea } from '@mantine/core';
import React, { useState } from 'react';

import { sendEmail } from './actions';

interface IEmailBuilderProps { }

export default function EmailBuilder() {
    const [emailText, setEmailText] = useState(`Hi {{firstname}},
Hope you are doing well. Here is a report that you might find interesting.`)
    const [recipients, setRecipients] = useState("ashirsc@gmail.com")
    const [sendingEmail, setSendingEmail] = useState(false)

    return (
        <Stack>
            <Textarea
                label="Email"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
            />
            <Textarea
                label="Recipients" 
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                />
            <Group justify='end'>

                <Button
                loading={sendingEmail}
                onClick={async () => {
                    console.log("sneding")
                    setSendingEmail(true)
                    await sendEmail(recipients, emailText)
                    setSendingEmail(false)
                    }}>Send</Button>
            </Group>
        </Stack>
    );
}