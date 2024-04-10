import { AssignabilityShape, AssignabilitySuffix, AssignabilityType, } from "@/types/formattersTypes"
import { MultiSelect, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"

import { ViewProps } from "./FormattedItemSingle"
import { z } from "zod"

export function FormattedAssignability({ form, onChange }: ViewProps<z.infer<typeof AssignabilityShape>>) {


  



    return (
    

            <Stack gap={4}>
                <Textarea autosize {...form.getInputProps('summary')} />


                <SimpleGrid cols={2} spacing="md">
                    
                    <Select
                        label="Type"
                        placeholder="N/A"
                        {...form.getInputProps('type')}
                        clearable
                        data={Object.keys(AssignabilityType)}
                        onChange={(value) => {
                            form.setFieldValue('type', value as AssignabilityType)
                            onChange()
                        }}
                    />
                    <MultiSelect
                        label="Tags"
                        {...form.getInputProps('suffix')}
                        clearable
                        data={Object.keys(AssignabilitySuffix)}
                        onChange={(value) => {
                            form.setFieldValue('suffix', value as AssignabilitySuffix[])
                            onChange()
                        }}
                    />
                </SimpleGrid>

            </Stack>
    )
}