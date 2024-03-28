"use client"

import { Anchor, Button, Checkbox, Container, Group, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";

import axios from "axios";
import { notifications } from "@mantine/notifications";
import { pixel } from "@/utils";
import { useForm } from "@mantine/form";

export function WaitlistSignup({ buttonText, inputWidth }: { buttonText: string, inputWidth?: number }) {

    const form = useForm({
        initialValues: {
            email: "",
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
          },
    })


    return (

        <form
            onSubmit={form.onSubmit(async (values) => {
                try {

                    await axios.post("https://submit-form.com/IkZtiKU2d", {
                        method: "POST",
                        body: values,
                    })
                    pixel.event("WaitlistJoin")
                    form.reset()
                    notifications.show({
                        title: "Thank you!",
                        message: "We'll be in touch soon.",

                    })
                } catch (error) {
                    notifications.show({
                        title: "Error",
                        message: "Something went wrong. Please try again later.",
                        color: "red",
                    })
                }

            })}
        >
            <Group mt={"sm"} align="flex-end">

                <TextInput w={inputWidth} {...form.getInputProps("email")} placeholder="Email" />


                <Button style={{ alignSelf: "center" }} type="submit" >
                    {buttonText}
                </Button>
            </Group>
        </form>
    );
}