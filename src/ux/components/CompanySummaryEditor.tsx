"use client";

import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  TextInput,
} from "@mantine/core";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";

import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import React from "react";
import StarterKit from "@tiptap/starter-kit";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { useDebouncedCallback } from "use-debounce";

const extensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Write something... Or type / to use commands",
    showOnlyWhenEditable: true,
  }),
  Markdown,
];

export default function CompanySummaryEditor({
  companyProfile,
}: {
  companyProfile: CompanyProfile_SB | null;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: companyProfile?.web_summary || "",
    onUpdate: ({ editor }) => {
      debouncedSaveContent(editor.getHTML());
    },
  });

  const sb = browserClient();

  const debouncedSaveContent = useDebouncedCallback(async (content: string) => {
    if (!companyProfile) return;
    const update = await sb
      .from("company_profile")
      .update({ web_summary: content })
      .eq("id", companyProfile.id!)
      .select()
      .single();
    if (update.error) {
      console.log(update.error);
    }
  }, 300);

  return (
    //<Group align="flex-start" m={"sm"}>
    <Paper flex={1} radius={8} withBorder p={"xs"} maw={900}>
      <EditorContent editor={editor} />

      <FloatingMenu
        editor={editor}
        tippyOptions={{ placement: "bottom-start" }}
        shouldShow={(props) => {
          const { selection } = props.editor.state;
          const { $from } = selection;
          const line = $from.nodeBefore?.textContent || "";
          return line == "/";
        }}
      >
        <Paper w={200} shadow="md" radius={"md"} withBorder py={"xs"}></Paper>
      </FloatingMenu>
      <BubbleMenu editor={editor}>
        <Button.Group>
          <Button
            miw={40}
            variant="default"
            size="compact-sm"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </Button>
          <Button miw={40} variant="default" size="compact-sm">
            H2
          </Button>
          <Button miw={40} variant="default" size="compact-sm">
            H3
          </Button>
          <Button miw={40} variant="default" size="compact-sm">
            P
          </Button>
          <Button
            miw={40}
            variant="default"
            size="compact-sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            B
          </Button>
        </Button.Group>
      </BubbleMenu>
    </Paper>
    //</Group>
  );
}
