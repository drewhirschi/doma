"use client"

import { Anchor, Button, Checkbox, Container, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { pixel } from "@/utils";
import { useForm } from "@mantine/form";

export function WaitlistSignup({ submitForm }: { submitForm: (values: any) => Promise<void> }) {

    const form = useForm({
        initialValues: {
            // name: "",
            email: "",
            // message: "",
            // terms: false,
        },

    })


    return (
        <Container size={"xs"} my={60} p="lg" id="schedule">
            <Title>Join our waitlist!</Title>
            <Text size="sm">Get updates on out progress</Text>
            <form
                onSubmit={form.onSubmit(async (values) => {
                    try {

                        await submitForm(values)
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
                <Stack mt={"sm"} >

                    {/* <TextInput {...form.getInputProps("name")} label="Name" /> */}
                    <TextInput {...form.getInputProps("email")} label="Email" />
                    {/* <Textarea {...form.getInputProps("message")} label="Tell us a little about your work" />
                    <Checkbox {...form.getInputProps("terms", { type: "checkbox" })} label={(<Text size="sm">
                        {`By checking the box and pressing "Submit", I acknoledge Parsl's `}<Anchor href="/docs/privacy-policy.pdf">Privacy Policy</Anchor>{` and agree to Parsl's `}<Anchor href="/docs/terms-of-use.pdf">Terms of Service</Anchor>.
                    </Text>)} /> */}

                    <Button style={{ alignSelf: "center" }} type="submit" >
                        Join
                    </Button>
                </Stack>
            </form>
        </Container>
    );
}