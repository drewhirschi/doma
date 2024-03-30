import { Anchor, CloseButton, Group, Stack } from "@mantine/core";

interface Props {
    annotations: Annotation_SB[],
    removeAnnotation: (id: string) => void
}

export function AnnotationsList({ annotations, removeAnnotation }: Props) {

    return (
        <Stack gap={2} >

            {annotations.map((ann) => (

                <AnnotationReference
                    key={ann.id}
                    ann={ann}
                    removeAnnotation={removeAnnotation}
                />
            ))}
        </Stack>
    )
}

export function AnnotationReference({ ann, removeAnnotation }: { ann: Annotation_SB, removeAnnotation: (id: string) => void }) {

    return (
        <Group
            maw={"100%"}
            justify="space-between"
        >

            <Anchor
                style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: 400
                }}
                key={ann.id}
                href={`#${ann.id}`}
            >{ann.text}</Anchor>
            <CloseButton onClick={() => removeAnnotation(ann.id)} />
        </Group>
    )
}