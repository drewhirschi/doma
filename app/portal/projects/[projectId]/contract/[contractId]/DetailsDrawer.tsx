import { Button, Stack, TextInput } from "@mantine/core";

import MetadataItem from "@/components/MetadataItem";
import { browserClient } from "@/supabase/BrowerClients";
import { notifications } from "@mantine/notifications";
import { useForm } from '@mantine/form';
import { useState } from "react";

interface ContractDetailsDrawerProps {
    contract: Contract_SB
}



export function ContractDetailsDrawer({ contract }: ContractDetailsDrawerProps) {
    const sb = browserClient()
    const form = useForm({
        initialValues: {
            display_name: contract.display_name ?? '',
            target: contract.target ?? '',
        },

    });
    const [isLoading, setIsLoading] = useState(false);



    return (
        <form onSubmit={form.onSubmit(async (values) => {
            setIsLoading(true)
            const { data, error } = await sb.from("contract").update({
                display_name: values.display_name,
                target: values.target
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
                <MetadataItem header="Id" text={contract.id} />
                <TextInput label="Name"
                    {...form.getInputProps('display_name')}
                />
                <TextInput label="Target"
                    {...form.getInputProps('target')} />
                <Button style={{ alignSelf: "flex-end" }} type="submit" loading={isLoading} disabled={isLoading}>Save</Button>
            </Stack>
        </form>
    );




}