import { Avatar, Combobox, Group, Input, InputBase, Text, useCombobox } from "@mantine/core";
import { useEffect, useState } from "react";

import { browserClient } from "@/supabase/BrowerClients";
import { getInitials } from "@/helper";

function SelectOption({ avatar, email, name }: { avatar: string, email: string, name: string, }) {
    return (
        <Group gap="sm">
            <Avatar size={32} src={avatar} radius={40} />
            <div>
                <Text fz="sm" fw={500}>
                    {name}
                </Text>
                <Text fz="xs" c="dimmed" truncate="end">
                    {email}
                </Text>
            </div>
        </Group>
    );
}

export function ReviewerCombobox({ selectedProfileId, contractId, projectMembers }: { projectMembers: any[], selectedProfileId: string, contractId: string }) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(selectedProfileId);

    const supabase = browserClient()

    const assigned_to = projectMembers.find(m => m.id == selectedMemberId)

    const options = projectMembers.map((profile: any) => (
        <Combobox.Option key={profile.id} value={profile.id}>
            <SelectOption avatar={getInitials(profile.display_name)} email={profile.email} name={profile.display_name} />
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={async (val) => {
                setSelectedMemberId(val)
                combobox.closeDropdown();
                await supabase.from("contract").update({ assigned_to: val }).eq("id", contractId)
            }}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                    multiline
                    variant="unstyled"
                >
                    {assigned_to ? (
                        <SelectOption avatar={""} email={assigned_to.email} name={assigned_to.display_name} />
                    ) : (
                        <Input.Placeholder>Not Assigned</Input.Placeholder>
                    )}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}