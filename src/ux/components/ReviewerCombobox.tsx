import {
  Avatar,
  Box,
  Combobox,
  Flex,
  Group,
  Input,
  InputBase,
  Text,
  useCombobox,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { getInitials } from "@/ux/helper";

function SelectOption({
  avatar,
  color,
  initials,
  name,
}: {
  avatar: string;
  color: string;
  initials: string;
  name: string;
}) {
  return (
    <Flex wrap={"nowrap"} gap="sm">
      {initials === "?" ? (
        <Avatar size={32} src={null}></Avatar>
      ) : (
        <Avatar size={32} color={color!}>
          {getInitials(name!)}
        </Avatar>
      )}
      <Text fz="sm" fw={500} truncate="end">
        {name}
      </Text>
    </Flex>
  );
}

export function ReviewerCombobox({
  selectedProfileId,
  projectMembers,
  handleUpdate,
}: {
  projectMembers: any[];
  handleUpdate: (memberId: string) => void;
  selectedProfileId?: string | null;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    selectedProfileId || "",
  );

  const supabase = browserClient();

  const assigned_to = projectMembers.find((m) => m.id == selectedMemberId);

  const options = projectMembers
    .filter((profile) => profile.id !== selectedProfileId)
    .map((profile: any) => (
      <Combobox.Option key={profile.id} value={profile.id}>
        <SelectOption
          avatar={profile.avatar_url}
          color={profile.color!}
          initials={getInitials(profile.display_name!)}
          name={profile.display_name}
        />
      </Combobox.Option>
    ));

  let newOption;

  if (selectedProfileId) {
    newOption = (
      <Combobox.Option key={null} value={""}>
        <SelectOption avatar={""} color={""} initials={"?"} name={"Unassign"} />
      </Combobox.Option>
    );
  }

  const allOptions = [...options, newOption];

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={async (val) => {
        setSelectedMemberId(val);
        combobox.closeDropdown();
        // updateContractAssignment(val, contractId)
        handleUpdate(val);
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
            <SelectOption
              avatar={assigned_to.avatar_url}
              color={assigned_to.color!}
              initials={getInitials(assigned_to.display_name!)}
              name={assigned_to.display_name}
            />
          ) : (
            <Input.Placeholder>Not Assigned</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{allOptions}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
