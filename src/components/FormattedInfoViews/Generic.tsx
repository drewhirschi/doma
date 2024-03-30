import { GenericFormatResponse, } from "@/types/formattersTypes"
import { Textarea } from "@mantine/core"
import { ViewProps } from "./FormattedItemSingle"

export function FormattedGeneric({ form }: ViewProps<GenericFormatResponse>) {




    return (


        <Textarea autosize style={{ whiteSpace: "pre-wrap" }} {...form.getInputProps('summary')} />

    )
}