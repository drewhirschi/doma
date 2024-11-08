"use client";

import { Button, Paper, Center, Text } from "@mantine/core";
import { BubbleMenu, EditorContent, FloatingMenu, useEditor } from "@tiptap/react";
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

export default function CompanySummaryEditor({ companyProfile }: { companyProfile: CompanyProfile_SB | null }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: companyProfile?.web_summary || "",
    editable: false, // Set to true to enable editing
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
    <Paper flex={1} radius={8} withBorder p={"xs"} maw={900}>
      {companyProfile && companyProfile.web_summary ? (
        <EditorContent editor={editor} />
      ) : (
        <Center style={{ height: "100%" }}>
          <Paper
            radius="lg"
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <Text size="lg" fw={600}>
              No Company Profile Available
            </Text>
            <Text size="md" mt="sm">
              Scraping in Progress. Check back in several minutes for company information!
            </Text>
          </Paper>
        </Center>
      )}

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
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
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
  );
}
