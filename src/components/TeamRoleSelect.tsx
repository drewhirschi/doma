import { Select } from "@mantine/core";

interface Props {
    defaultValue: string;
    withLabel?: boolean;
}


export function TeamRoleSelect({defaultValue, withLabel}: Props) {

    const rolesData = ['Admin', 'Associate',];

    return <Select
        data={rolesData}
        defaultValue={defaultValue}
        label={withLabel ? "Role" : undefined}
        variant={!withLabel ? "unstyled" : undefined}
        allowDeselect={false}
    />
}