"use client";

import { ActionIcon, TextInput } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { useState } from "react";

interface CompanyTitleEditorProps {
  companyId: string;
  initialName: string;
  origin?: string;
}

export function CompanyTitleEditor({
  companyId,
  initialName,
  origin,
}: CompanyTitleEditorProps) {
  const [companyName, setCompanyName] = useState<string>(initialName);
  const sb = browserClient();

  const debouncedSaveCompanyName = useDebouncedCallback(
    async (newName: string) => {
      const update = await sb
        .from("company_profile")
        .update({ name: newName })
        .eq("id", companyId)
        .select()
        .single();
      if (update.error) {
        console.log(update.error);
      }
    },
    100,
  );

  const handleNameChange = (newName: string) => {
    setCompanyName(newName);
    debouncedSaveCompanyName(newName);
  };

  return (
    <>
      <TextInput
        value={companyName}
        onChange={(event) => handleNameChange(event.currentTarget.value)}
        size="lg"
        styles={{ input: { fontSize: "1.5rem", fontWeight: "bold" } }}
        placeholder="Company Name"
      />
      {origin && (
        <ActionIcon
          variant="transparent"
          component={Link}
          href={origin}
          target="_blank"
        >
          <IconExternalLink />
        </ActionIcon>
      )}
    </>
  );
}
