import { Anchor, Badge, Button, Group, Stack, Text, Textarea, Title } from "@mantine/core"
import { FormatterViewProps, IFormatResponse, IPOwnershipFormatResponse } from "@/types/formattersTypes"

import { EIReferenceLinks } from "./EIReferences"
import { FormattedInfoWithEiId } from "@/types/complex"
import { notifications } from "@mantine/notifications"
import { useForm } from "@mantine/form"
import { useState } from "react"

export function FormattedGeneric({ info, handleSave }: FormatterViewProps) {



    const data: IFormatResponse = info?.data as unknown as IFormatResponse

    const extractedInfoRefs = info?.extracted_information?.map(ei => ei.id) ?? []
    const form = useForm({
        initialValues: data,
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
            <Stack gap={0}>

                <Textarea autosize style={{ whiteSpace: "pre-wrap" }} {...form.getInputProps('summary')} />
                {extractedInfoRefs.length > 0 && <EIReferenceLinks ids={extractedInfoRefs} />}
                <Button loading={loading} size="xs" style={{alignSelf: "flex-end"}} mt={"sm"} type="submit" disabled={!form.isDirty()} color="blue">Save</Button>

            </Stack>
        </form>
    )
}