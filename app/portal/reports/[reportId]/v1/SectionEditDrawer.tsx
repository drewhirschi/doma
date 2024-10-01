"use client";

import {
  ActionIcon,
  Box,
  Button,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";

import { Editor } from "@tiptap/react";
import { ISection } from "./types";
import { SearchResultPreview } from "./SearchResultPreview";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { useDebouncedCallback } from "use-debounce";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { writeSection } from "./actions";

interface SectionDrawerProps {
  sectionData: ReportSection_SB & { search_result: SearchResult_SB[] };
  topic: string;
  editor: Editor;
}

export function SectionDrawerContents({
  sectionData,
  topic,
  editor,
}: SectionDrawerProps) {
  const [section, setSection] = useState(sectionData);
  const [redraftState, setRedraftState] = useState("idle");

  const debouncedSetSections = useDebouncedCallback(
    (sections: ISection[]) => {},
    500,
  );

  return (
    <Stack>
      <Grid align="flex-end">
        <Grid.Col span={8}>
          <TextInput
            label="Section description"
            onChange={(e) => {
              // setSection({ ...section, intr: e.target.value })
              // debouncedSetSections(allSections)
            }}
            value={section.instruction ?? ""}
          />
        </Grid.Col>
        <Grid.Col span="auto">
          <Button
            loading={redraftState === "loading"}
            onClick={async () => {
              setRedraftState("loading");
              const draftedSection = await writeSection(section, topic);
              editor.commands.setContent(draftedSection.text);
              const sb = browserClient();
              const update = await sb
                .from("report_sections")
                .update({ content: draftedSection.text })
                .eq("id", section.id!);
              setRedraftState("idle");
              // setSection(redoneSection)
              // debouncedSetSections(allSections)
            }}
          >
            Write
          </Button>
        </Grid.Col>
      </Grid>

      <Text size="sm" fw={500}>
        Sources ({section.search_result?.length ?? 0})
      </Text>
      {section.search_result?.map((searchResult, i) => (
        <SearchResultPreview
          searchResult={searchResult}
          key={searchResult.url}
          // summary={section.summaries?.[i]?.text ?? ""}
        />
      ))}
    </Stack>
  );
}
