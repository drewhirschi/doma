import { Anchor, Group } from "@mantine/core";

export function EIReferenceLinks({ids}: {ids: string[]}) {
    return (
        <Group gap={2}>

        {ids.map((id, index) => (
            <Anchor key={id} href={`#${id}`}>[{index + 1}]</Anchor>
        ))}
    </Group>
    )
}