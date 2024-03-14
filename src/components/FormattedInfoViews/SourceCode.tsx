import { Anchor, Badge, Button, Group, Stack, Text, Textarea, Title } from "@mantine/core"
import { FormatterViewProps, IFormatResponse, IPOwnershipFormatResponse, SourceCodeFormatResponse } from "@/types/formattersTypes"

import { EIReferenceLinks } from "./EIReferences"
import { FormattedInfoWithEiId } from "@/types/complex"
import { notifications } from "@mantine/notifications"
import { useForm } from "@mantine/form"
import { useState } from "react"

export function FormattedSourceCode({ info, handleSave }: FormatterViewProps) {


    const data = info?.data as unknown as SourceCodeFormatResponse | undefined

    const extractedInfoRefs = info?.extracted_information?.map(ei => ei.id) ?? []

    const form = useForm({
        initialValues: {

            content: data?.content,
            releaseConditions: data?.releaseConditions,
            license: data?.license,

        },
    });
    const [loading, setLoading] = useState(false);


    return (

        <form onSubmit={form.onSubmit(async (values) => {
            setLoading(true)
            try {
                await handleSave(values)
                form.resetDirty()
            } catch (e) {
                console.error(e)
                notifications.show({
                    title: "Failed to save",
                    message: "An error occurred while saving the data",
                    color: "red"
                })
            }
            setLoading(false)
        })}>
            <Stack>

                <Textarea
                    label="Content"
                    {...form.getInputProps('content')}
                />
                <Textarea
                    label="Release conditions"
                    {...form.getInputProps('releaseConditions')}
                />
                <Textarea
                    label="License"
                    {...form.getInputProps('license')}
                />

                <Button loading={loading} size="xs" style={{ alignSelf: "flex-end" }} mt={"sm"} type="submit" disabled={!form.isDirty() || loading} color="blue">Save</Button>

            </Stack>
        </form>
    )
}