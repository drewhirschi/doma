"use client";

import { ActionIcon, TextInput } from "@mantine/core";
import { IconEdit, IconX, IconExternalLink } from "@tabler/icons-react";
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {isEditing ? (
        <>
          <TextInput
            value={companyName || origin}
            onChange={(event) => handleNameChange(event.currentTarget.value)}
            size="lg"
            styles={{ input: { fontSize: "1.5rem", fontWeight: "bold" } }}
            placeholder="Company Name"
            onBlur={() => setIsEditing(false)}
          />
          <ActionIcon
            onClick={() => setIsEditing(false)}
            variant="transparent"
            aria-label="Close editor"
          >
            <IconX />
          </ActionIcon>
        </>
      ) : (
        <>
          <span
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              cursor: "default",
            }}
          >
            {companyName || origin}
          </span>
          <ActionIcon
            onClick={() => setIsEditing(true)}
            variant="transparent"
            aria-label="Edit company name"
          >
            <IconEdit />
          </ActionIcon>
        </>
      )}
    </div>
  );
}
