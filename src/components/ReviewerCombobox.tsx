import { Avatar, Combobox, Group, Input, InputBase, Text, useCombobox } from "@mantine/core";

import { useState } from "react";

export const teamMembers = [
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-9.png',
        name: 'Robert Wolfkisser',
        job: 'Engineer',
        email: "robert@atlas.com",
        role: 'Admin',
        lastActive: '2 days ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
        name: 'Emily Johnson',
        job: 'Designer',
        email: "emily@atlas.com",
        role: 'User',
        lastActive: '1 day ago',
        active: true,
    },
    {
        avatar:
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-11.png',
        name: 'Michael Smith',
        job: 'Developer',
        email: "michael@atlas.com",
        role: 'User',
        lastActive: '3 days ago',
        active: false,
    },
];


function SelectOption({ avatar, email, name }: {avatar: string, email: string, name: string,}) {
    return (
        <Group gap="sm">
        <Avatar size={40} src={avatar} radius={40} />
        <div>
            <Text fz="sm" fw={500}>
                {name}
            </Text>
            <Text fz="xs" c="dimmed">
                {email}
            </Text>
        </div>
    </Group>
    );
  }

export function ReviewerCombobox() {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
      });
    
      const [value, setValue] = useState<string | null>("robert@atlas.com");
      const selectedOption = teamMembers.find((item) => item.email === value);

    const options = teamMembers.map((item) => (
        <Combobox.Option  key={item.email} value={item.email}>
          <SelectOption {...item} />
        </Combobox.Option>
      ));

    return (
        <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
            setValue(val);
            combobox.closeDropdown();
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
                {selectedOption ? (
                    <SelectOption {...selectedOption} />
                ) : (
                    <Input.Placeholder>Pick value</Input.Placeholder>
                )}
            </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
            <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
    </Combobox>
    )
}