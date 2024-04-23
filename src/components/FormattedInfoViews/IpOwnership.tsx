import { ActionIcon, Anchor, Badge, Box, Button, Checkbox, Group, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { IPOwnershipFormatResponse, IPOwnershipItemShape, IpOwnershipType } from "@/types/formattersTypes"

import { BoolSelect } from "../BoolSelect"
import { ItemViewProps } from "./FormattedItemList"
import { z } from "zod"

export function FormattedIpOwnership({ form, index, onChange }: ItemViewProps<z.infer<typeof IPOwnershipItemShape>>) {







    return (


        <Box>

            <Textarea
                // label="Summary"
                {...form.getInputProps(`infos.${index}.data.summary`)}
                autosize 
                value={form.getInputProps(`infos.${index}.data.summary`).value ?? ""}

            />
            <SimpleGrid cols={2} spacing="md">
                <Select
                    label="Direction"
                    {...form.getInputProps(`infos.${index}.data.direction`)}
                    data={[{ label: "Inbound", value: IpOwnershipType.INBOUND }, { label: "Outbound", value: IpOwnershipType.OUTBOUND }, { label: "Joint ownership", value: IpOwnershipType.JOINT }]}
                />

                <BoolSelect
                    label="Not present assignment"
                    {...form.getInputProps(`infos.${index}.data.not_present_assignment`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.not_present_assignment`, value)
                        onChange()
                    }}
                />
                <BoolSelect
                    label="Feedback"
                    {...form.getInputProps(`infos.${index}.data.feedback`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.feedback`, value)
                        onChange()
                    }}
                />

            </SimpleGrid>

        </Box>

    )
}