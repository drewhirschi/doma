"use client";

import { Box, Button, Divider, Paper, Stack, Title } from "@mantine/core";
import {
  BubbleMenu,
  EditorContent,
  EditorProvider,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useReducer, useState } from "react";

import Markdown from "react-markdown";
import { NewSectionDrawer } from "./NewSectionDrawer";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

// define your extension array
const extensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Write something... Or type / to use commands",
    showOnlyWhenEditable: true,
  }),
];

interface IReportEditorProps {
  report: Report_SB & { report_sections: ReportSection_SB[] };
}

export default function ReportEditor({ report }: IReportEditorProps) {
  // const [state, dispatch] = useReducer(first, second, third)
  const [sections, setSections] = useState(report.report_sections);

  const [content, setContent] = useState("<p>Hello World!</p>");
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
  });

  if (!editor) return null;

  return (
    <Box>
      <EditorContent editor={editor} />
      <FloatingMenu
        editor={editor}
        tippyOptions={{ placement: "bottom-start" }}
        shouldShow={(props) => {
          console.log("running shouldShow");
          const { selection } = props.editor.state;
          const { $from } = selection;
          const line = $from.nodeBefore?.textContent || "";
          return line == "/";
        }}
      >
        <Paper w={200} shadow="md" radius={"md"} withBorder py={"xs"}>
          {/* <Title pl={"xs"} order={6} c={"dark.7"}>Basics</Title>
                        <Button.Group variant='subtle' c={"gray"} orientation='vertical' px={"xs"} borderWidth={0}>
                            <Button variant="default" size='compact-sm'
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 })}
                            >Heading 1</Button>
                            <Button variant="default" size='compact-sm'>Heading 2</Button>
                            <Button variant="default" size='compact-sm'>Heading 3</Button>
                        </Button.Group> */}
          <Title pl={"xs"} pt={4} order={5} c={"dark.7"}>
            AI Write
          </Title>
          <Stack>
            <NewSectionDrawer />
          </Stack>
        </Paper>
      </FloatingMenu>
      <BubbleMenu editor={editor}>
        <Button.Group>
          <Button
            variant="default"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 })}
            size="compact-sm"
          >
            H1
          </Button>
          <Button variant="default" size="compact-sm">
            H2
          </Button>
          <Button variant="default" size="compact-sm">
            H3
          </Button>
        </Button.Group>
      </BubbleMenu>
      {sections.map((section) => (
        <Markdown key={section.id}>{section.content}</Markdown>
      ))}
      {/* <Divider my={"sm"}
                label={
                    <Button variant="subtle" rightSection={<IconPlus size={14} />}
                    >Add</Button>
                }
            /> */}
    </Box>
  );
}
