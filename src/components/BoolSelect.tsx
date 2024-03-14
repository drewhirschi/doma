import { GetInputProps } from "@mantine/form/lib/types";
import { Select } from "@mantine/core";

function strToNullableBool(str: string | null | undefined) {
    if (str === "true") return true
    if (str === "false") return false
    return null
}


export function BoolSelect({ formInputProps }: { formInputProps: GetInputProps<any> }) {



    return (
        <Select
            label="Expired"
            placeholder="N/A"
            {...formInputProps}
            
            clearable
            data={[{ label: "Yes", value: 'true' }, { label: "No", value: 'false' },]}
        />)
}