import { ActionIcon, Anchor, Badge, Box, Button, Checkbox, Group, MultiSelect, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { LicenseDirection, LicenseFormatResponse, LicenseItemShape, LicenseSuffix, TerminationFormatResponse, TerminationTag } from "@/types/formattersTypes"

import { BoolSelect } from "../BoolSelect";
import { ItemViewProps } from "./FormattedItemList";

export function FormattedLicense({ form, onChange, index }: ItemViewProps<Zod.infer<typeof LicenseItemShape>>) {





    return (



        <Box
        >

            <Textarea autosize name="summary"
                {...form.getInputProps(`infos.${index}.data.summary`)}
            />
            <SimpleGrid cols={2} spacing="md">
                <BoolSelect
                    label="Exclusive"
                    {...form.getInputProps(`infos.${index}.data.exclusive`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.exclusive`, value)
                        onChange()
                    }}
                />
                <Select label="Type"
                    data={Object.keys(LicenseSuffix)}
                    {...form.getInputProps(`infos.${index}.data.type`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.type`, value)
                        onChange()
                    }}
                />
                <Select label="Direction"
                    data={Object.keys(LicenseDirection)}
                    {...form.getInputProps(`infos.${index}.data.direction`)}
                    onChange={(value) => {
                        form.setFieldValue(`infos.${index}.data.direction`, value)
                        onChange()
                    }}
                />
                {/* <Select label="Exclusive"
                                data={['Yes', "No"]}
                                {...form.getInputProps(`items.${i}.exclusive`)}
                            /> */}
            </SimpleGrid>
        </Box>

    )
}