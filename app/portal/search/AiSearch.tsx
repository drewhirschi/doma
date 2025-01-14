"use client";

import { Box, Button, Textarea } from "@mantine/core";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface IAiSearchProps {}

export default function AiSearch({}: IAiSearchProps) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const router = useRouter();

  async function runSearch() {
    router.push("/portal/search/query?q=" + encodeURIComponent(q));
  }

  return (
    <Box pos={"relative"}>
      <Textarea
        value={q}
        autosize
        minRows={2}
        placeholder="Describe the company that you are looking for"
        onChange={(e) => {
          setQ(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents newline
            runSearch();
          } else if (e.key === "Enter" && e.shiftKey) {
            // Allow newline on Ctrl+Enter
          }
        }}
      />
      <Button
        pos={"absolute"}
        right={10}
        bottom={10}
        onClick={runSearch}
        radius="sm"
        variant="gradient"
        gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
      >
        Search
      </Button>
    </Box>
  );
}
