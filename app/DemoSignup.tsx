"use client"

import { Anchor, Button, Checkbox, Container, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

export function DemoSignup({ submitForm }: { submitForm: (values: any) => Promise<void> }) {

    const form = useForm({
        initialValues: {
            name: "",
            email: "",
            message: "",
            terms: false,
        },

    })

    // IkZtiKU2d


    return (
        <Container my={60} p="lg" id="schedule">
            <Title>Schedule a demo today</Title>
            <form
                onSubmit={form.onSubmit(async (values) => {
                    try {

                        await submitForm(values)
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
                <Stack mt={"sm"} >

                    <TextInput {...form.getInputProps("name")} label="Name" />
                    <TextInput {...form.getInputProps("email")} label="Email" />
                    <Textarea {...form.getInputProps("message")} label="Tell us a little about your work" />
                    <Checkbox {...form.getInputProps("terms", { type: "checkbox" })} label={(<Text size="sm">
                        By checking the box and pressing "Submit", I acknoledge Parsl's <Anchor href="/docs/privacy-policy.pdf">Privacy Policy</Anchor> and agree to Parsl's <Anchor href="/docs/terms-of-use.pdf">Terms of Service</Anchor>.
                    </Text>)} />

                    <Button style={{ alignSelf: "center" }} type="submit" disabled={!form.values.terms}>
                        Submit
                    </Button>
                </Stack>
            </form>
        </Container>
    );
}