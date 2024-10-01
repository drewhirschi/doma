import { Select, SelectProps } from "@mantine/core";

function strToNullableBool(str: string | null) {
  if (str === "true") return true;
  if (str === "false") return false;
  return null;
}

interface BoolSelectProps extends Omit<SelectProps, "onChange"> {
  onChange: (value: boolean | null) => void;
}

export function BoolSelect(props: BoolSelectProps) {
  return (
    <Select
      placeholder="N/A"
      {...props}
      onChange={(value) => {
        props.onChange(strToNullableBool(value));
      }}
      clearable
      value={props.value?.toString()}
      // @ts-ignore
      data={[
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ]}
    />
  );
}
