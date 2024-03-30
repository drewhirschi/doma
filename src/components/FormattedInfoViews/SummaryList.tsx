import { Box, Textarea } from "@mantine/core"

import { GenericFormatResponseShape } from "@/types/formattersTypes"
import { ItemViewProps } from "./FormattedItemList"
import { z } from "zod"

export function FormattedSummaryList({ form, index, onChange }: ItemViewProps<z.infer<typeof GenericFormatResponseShape>>) {






    return (


        <Box>

            <Textarea
                {...form.getInputProps(`items.${index}.data.summary`)}
            />

        </Box>


    )
}