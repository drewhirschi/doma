import { Box, Select, Textarea, } from "@mantine/core"
import { TerminationItemShape, TerminationTag } from "@/types/formattersTypes"

import { ItemViewProps } from "./FormattedItemList";
import { UseFormReturnType } from "@mantine/form";
import { z } from "zod";

export function FormattedTermination({ form, index, onChange }: ItemViewProps<z.infer<typeof TerminationItemShape>>) {



    return (

        <Box>

            <Textarea autosize name="summary"
                {...form.getInputProps(`infos.${index}.data.summary`)}
                value={form.getInputProps(`infos.${index}.data.summary`).value ?? ""}

            />
            <Select label="Type"
                {...form.getInputProps(`infos.${index}.data.tag`)}
                onChange={(value) => {
                    form.setFieldValue(`infos.${index}.data.tag`, value)
                    onChange()
                }}
                data={[
                    { value: TerminationTag.CONVENIENCE, label: "Convenience" },
                    { value: TerminationTag.CHANGE_OF_CONTROL_TERMINATION, label: "Change of control termination" },
                    { value: TerminationTag.TERMINATED, label: "Terminated" }
                ]} />
        </Box>


    )
}