"use client";

import { Box, Button, Textarea } from "@mantine/core";
import React, { useState } from "react";

import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { getEmbedding } from "@/shared/llmHelpers";
import { createSearch } from "./actions";

interface IAiSearchProps {}

export default function AiSearch({}: IAiSearchProps) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Box component="form" pos={"relative"} action={createSearch}>
      <Textarea
        name="query"
        autosize
        minRows={2}
        placeholder="Describe the company you are looking for"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.currentTarget.dispatchEvent(
              new Event("submit", { bubbles: true, cancelable: true }),
            );
          }
        }}
      />
      <Button
        pos={"absolute"}
        right={10}
        bottom={10}
        type="submit"
        // component={Link} href={"/portal/datasets"}
        // onClick={async () => {
        //   setLoading(true);
        //   console.log(q);
        //   const emb = await getEmbedding(q);
        //   setEmb(emb);
        //   setLoading(false);
        // }}
      >
        Search
      </Button>
    </Box>
  );
}
