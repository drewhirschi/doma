import { Box, Fieldset, SimpleGrid, TagsInput, Textarea, } from "@mantine/core"

import { BoolSelect } from "../BoolSelect"
import { ItemViewProps } from "./FormattedItemList"
import { LimitationOfLiabilityShape } from "@/types/formattersTypes"
import { ViewProps } from "./FormattedItemSingle"
import { z } from "zod"

export function FormattedLimitationOfLiability({ form, afterChange }: ViewProps<z.infer<typeof LimitationOfLiabilityShape>>) {

    return (
        <Box>
            <Textarea
                label="Summary"
                {...form.getInputProps(`summary`)}
                value={form.getInputProps(`summary`).value ?? ""}
                autosize
            />
            {/* <Fieldset legend="Direct Damages"
            // variant="unstyled"
            >
                <Textarea
                    label="Amount"
                    {...form.getInputProps(`directDamagesLimit?.amount`)}
                    value={form.getInputProps(`directDamagesLimit?.amount`).value ?? ""}
                    autosize
                />
                <SimpleGrid cols={2} spacing="md">
                    <BoolSelect
                        label="Waived"
                        {...form.getInputProps(`directDamagesLimit?.waived`)}
                        onChange={(value) => {
                            form.setFieldValue(`directDamagesLimit?.waived`, value)
                            afterChange()
                        }}
                    />
                    <BoolSelect
                        label="Silent"
                        {...form.getInputProps(`directDamagesLimit?.silent`)}
                        onChange={(value) => {
                            form.setFieldValue(`directDamagesLimit?.silent`, value)
                            afterChange()
                        }}
                    />
                </SimpleGrid>
                <TagsInput
                    label="Exceptions"
                    {...form.getInputProps(`directDamagesExceptions`)}
                    value={form.getInputProps(`directDamagesExceptions`).value ?? []}
                    onChange={(value) => {
                        form.setFieldValue(`directDamagesExceptions`, value)
                        afterChange()
                    }}
                />

            </Fieldset>
            <Fieldset mt={"sm"} legend="Consequential Damages"
            // variant="unstyled"
            >
                <Textarea
                    label="Amount"
                    {...form.getInputProps(`consequentialDamagesLimit?.amount`)}
                    value={form.getInputProps(`consequentialDamagesLimit?.amount`).value ?? ""}
                    autosize
                />
                <SimpleGrid cols={2} spacing="md">
                    <BoolSelect
                        label="Waived"
                        {...form.getInputProps(`consequentialDamagesLimit?.waived`)}
                        onChange={(value) => {
                            form.setFieldValue(`consequentialDamagesLimit?.waived`, value)
                            afterChange()
                        }}
                    />
                    <BoolSelect
                        label="Silent"
                        {...form.getInputProps(`consequentialDamagesLimit?.silent`)}
                        onChange={(value) => {
                            form.setFieldValue(`consequentialDamagesLimit?.silent`, value)
                            afterChange()
                        }}
                    />
                </SimpleGrid>
                <TagsInput
                    label="Exceptions"
                    {...form.getInputProps(`consequentialDamagesExceptions`)}
                    value={form.getInputProps(`consequentialDamagesExceptions`).value ?? []}
                    onChange={(value) => {
                        form.setFieldValue(`consequentialDamagesExceptions`, value)
                        afterChange()
                    }}
                />

            </Fieldset> */}
        </Box>

    )
}