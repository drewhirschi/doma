"use client";

import { Box, Button, Textarea } from "@mantine/core";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createSearch } from "./actions";
import { browserClient } from "@/ux/supabase-client/BrowserClient";

interface IAiSearchProps {}

export default function AiSearch({}: IAiSearchProps) {
  const [q, setQ] = useState("");
  const params = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.searchId) return;
    const sb = browserClient();
    sb.from("searches")
      .select()
      .eq("id", params.searchId)
      .single()
      .then((res) => {
        if (res.data) {
          setQ(res.data.query);
        }
      });
  }, [params.searchId]);

  async function runSearch() {
    setLoading(true);
    await createSearch(q, params.searchId as string);
    setLoading(false);
  }

  return (
    <Box pos={"relative"}>
      <Textarea
        value={q}
        autosize
        minRows={2}
        placeholder="Describe the company you are looking for"
        onChange={(e) => {
          setQ(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            runSearch();
          }
        }}
      />
      <Button pos={"absolute"} right={10} bottom={10} onClick={runSearch} loading={loading}>
        Search
      </Button>
    </Box>
  );
}
