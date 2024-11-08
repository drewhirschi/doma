"use client";

import { Box, Button, Group, Stack } from "@mantine/core";
import { useEffect, useState } from "react";

import Markdown from "react-markdown";
import { QueryData } from "@supabase/supabase-js";
import { Tables } from "@/shared/types/supabase-generated";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { serverClient } from "@/shared/supabase-client/server";

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export default function Page() {
  const sb = browserClient();

  const cmpQuery = sb.from("company_profile").select("*, comp_pages(*)");
  type CompaniesWithPages = QueryData<typeof cmpQuery>;

  const [cmps, setCmps] = useState<CompaniesWithPages>([]);
  const [activeCmp, setActiveCmp] = useState<ArrayElement<CompaniesWithPages> | null>(null);
  const [activePage, setActivePage] = useState<Tables<"comp_pages"> | null>(null);

  useEffect(() => {
    cmpQuery.then((cmps) => cmps.data && setCmps(cmps.data));
  }, [cmpQuery]);

  return (
    <Group align="flex-start" wrap="nowrap">
      <Stack style={{ borderRight: "1px solid black" }}>
        {cmps.map((cmp) => (
          <Button key={cmp.id} variant="default" onClick={() => setActiveCmp(cmp)}>
            {cmp.name}
          </Button>
        ))}
      </Stack>
      <Stack style={{ borderRight: "1px solid black" }}>
        {activeCmp?.comp_pages.map((page) => {
          const pathname = new URL(page.url).pathname;

          return (
            <Button key={page.url} variant="default" onClick={() => setActivePage(page)}>
              {pathname}
            </Button>
          );
        })}
      </Stack>
      <Stack>
        {activePage?.url}
        {/* {activePage?.md} */}
        <Markdown>{activePage?.cmp_info}</Markdown>
      </Stack>
    </Group>
  );
}
