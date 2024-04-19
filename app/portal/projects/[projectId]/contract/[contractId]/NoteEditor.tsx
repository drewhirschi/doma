// import { Box, Group, Text, Title } from "@mantine/core";
// import { BubbleMenu, Editor, useEditor } from '@tiptap/react';
// import { Link, RichTextEditor } from '@mantine/tiptap';

// import { ParsletWithNotes } from './ContractReviewer';
// import StarterKit from '@tiptap/starter-kit';

// interface IProps {
//     // content: string
//     parslet: ParsletWithNotes
//     editor: Editor
// }

// export function NoteEditor(props: IProps) {
//     const { editor } = props
//     const title = <Text size="lg" fw={700}>{props.parslet.display_name}</Text>

//     // if (!editor?.getText()) {
//     //     return <Group>
//     //         {title}
//     //         <Text c={"dimmed"} size='xs'>No content</Text>
//     //     </Group>
//     // }

//     return (
//         <Box>
//             {title}
//             <RichTextEditor editor={editor} mb={"md"}>
//                 {editor && (
//                     <BubbleMenu editor={editor}>
//                         <RichTextEditor.ControlsGroup>
//                             <RichTextEditor.Bold />
//                             <RichTextEditor.Italic />
//                             <RichTextEditor.Link />
//                         </RichTextEditor.ControlsGroup>
//                     </BubbleMenu>
//                 )}
//                 <RichTextEditor.Content />
//             </RichTextEditor>
//         </Box>
//     );
// }