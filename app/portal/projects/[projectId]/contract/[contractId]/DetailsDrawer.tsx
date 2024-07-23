import { ActionIcon, Box, Button, Group, Select, Stack, Text, TextInput, Textarea } from "@mantine/core";

import { AgreementTypes } from "@/types/enums";
import { IconDownload } from "@tabler/icons-react";
import MetadataItem from "@/components/MetadataItem";
import { browserClient } from "@/supabase/BrowserClient";
import { notifications } from "@mantine/notifications";
import { useForm } from '@mantine/form';
import { useState } from "react";

interface ContractDetailsDrawerProps {
    contract: Contract_SB
    downloadContractUrl: string | undefined
}



export function ContractDetailsDrawer({ contract, downloadContractUrl }: ContractDetailsDrawerProps) {
    const sb = browserClient()
    const form = useForm({
        initialValues: {
            display_name: contract.display_name ?? '',
            target: contract.target ?? '',
            description: contract.description ?? '',
            tag: contract.tag ?? ''
        },

    });
    const [isLoading, setIsLoading] = useState(false);



    return (
        <Stack>
            <Group justify="space-between">

                <MetadataItem header="Id" text={contract.id} copyButton />
                <ActionIcon variant="filled" aria-label="Download" disabled={downloadContractUrl === undefined}>
                    <IconDownload style={{ width: '70%', height: '70%' }} stroke={1.5}
                        onClick={async () => {
                            const { data, error } = await sb.storage.from('tenants').download(contract.name);
                            if (error) {
                                notifications.show({
                                    title: 'Error downloading',
                                    message: error.message,
                                    color: 'red',
                                });
                            } else {
                                const url = URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = contract.display_name ?? `${contract.id}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }
                        }}
                    />
                </ActionIcon>
            </Group>

            <form onSubmit={form.onSubmit(async (values) => {
                setIsLoading(true)
                const { data, error } = await sb.from("contract").update({
                    display_name: values.display_name,
                    target: values.target,
                    description: values.description,
                    tag: values.tag
                }).eq("id", contract.id)
                setIsLoading(false)

                if (error) {
                    notifications.show({
                        title: "Error",
                        message: error.message,
                        color: "red"
                    })
                }
            })}>

                <Stack >
                    <Textarea label="Description"
                        {...form.getInputProps('description')}
                    />

                    <Select
                        {...form.getInputProps('tag')}
                        label="Type"
                        placeholder="None selected"
                        data={Object.values(AgreementTypes).map((key) => ({ value: key, label: key.split("_").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") }))}
                    />
                    <TextInput label="Name"
                        {...form.getInputProps('display_name')}
                    />
                    <TextInput label="Target"
                        {...form.getInputProps('target')} />
                    <Button style={{ alignSelf: "flex-end" }} type="submit" loading={isLoading} disabled={isLoading}>Save</Button>
                </Stack>
            </form>

        </Stack>
    );




}