import { Group, Text } from "@mantine/core";

import { ClassicCopyButton } from "./ClassicCopyButton";
import React from "react";

export function MetadataItem({
  header,
  text,
  copyButton,
}: {
  header: string;
  text: string;
  copyButton?: boolean;
}) {
  return (
    <div>
      <Text fw={500}>{header}</Text>
      <Group>
        <Text c="dimmed" size="sm">
          {text}
        </Text>
        {copyButton && <ClassicCopyButton copyValue={text} />}
      </Group>
    </div>
  );
}

export default MetadataItem;
