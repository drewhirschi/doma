"use client"

import { Anchor, Box, Button, Checkbox, Container, Divider, Grid, Group, Modal, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

import axios from "axios";
import { notifications } from "@mantine/notifications";
import { pixel } from "@/utils";
import { theme } from "../theme";
import { useForm } from "@mantine/form";

interface Props {
    callToAction?: string
    secondaryDesription?: string
}
export function WaitlistSignup({callToAction}:Props) {
    const [opened, { open, close: closeModal }] = useDisclosure(false);
    const largeScreen = useMediaQuery(`(min-width: ${theme.breakpoints?.sm || 48}em)`); // Ensure proper units

    let pathname = '';
    if (typeof window !== 'undefined') {
        pathname = window.location.pathname;
    }

    const form = useForm({
        initialValues: {
            email: "",
            first: "",
            last: "",
            title: "",
            company: "",
            url: pathname
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    })


    return (
        <>
            <Modal
                opened={opened}
                onClose={closeModal}
                title={ callToAction ?? "Join the Waitlist"}
                size={largeScreen ? "lg" : "md"}
            >

                {/* Modal content */}

                <form
                    onSubmit={form.onSubmit(async (values) => {
                        try {

                            // await axios.post("https://submit-form.com/echo", {
                            await axios.post("https://submit-form.com/IkZtiKU2d", {
                                method: "POST",
                                body: values,
                            })
                            pixel.event("WaitlistJoin")
                            form.reset()
                            closeModal()
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
                    <Divider />


                    <Text py={"sm"}>
                        As we have capacity, you can expect an email to schedule a get-to-know-you call.
                    </Text>

                    <Box >

                        <SimpleGrid cols={{ base: 1, sm: 2 }}
                        >
                            <TextInput {...form.getInputProps("first")} label="First Name" placeholder="First Name" />
                            <TextInput {...form.getInputProps("last")} label="Last Name" placeholder="Last Name" />
                            <TextInput {...form.getInputProps("email")} required label="Email" placeholder="Email" />
                            <TextInput {...form.getInputProps("title")} label="Title" placeholder="Title" />
                            <TextInput {...form.getInputProps("company")} label="Company" placeholder="Company" />

                        </SimpleGrid>


<Group justify="flex-end">

                        <Button mt={"xl"} type="submit" >
                            Submit
                        </Button>
</Group>
                    </Box>

                </form>
            </Modal>

            <Button onClick={open}
                //  styles={{label: {fontSize: 24}}}
                size="lg"
                variant="gradient"
                gradient={{ "deg": 30, from: "blue.8", to: "blue.6" }}
                fw={500}
            >{callToAction ?? "Join the Waitlist"}</Button >
        </>
    );
}