"use client";

import { Group, Pagination, TextInput, rem, ActionIcon } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { PAGE_SIZE } from "./[cmpId]/shared";
import { useEffect, useState } from "react";

export function SearchAndPage({ totalCount }: { totalCount: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("query") ?? "",
  );

  const debouncedHandleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.delete("page");
      params.set("query", value);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    setSearchQuery(searchParams.get("query") ?? "");
  }, [searchParams]);

  function updatePage(value: number) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("page", value.toString());
    } else {
      params.delete("page");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  const clearSearch = () => {
    setSearchQuery("");
    debouncedHandleSearch("");
  };

  return (
    <Group align="baseline">
      <TextInput
        miw={300}
        placeholder="Search"
        leftSection={
          <IconSearch
            style={{ width: rem(16), height: rem(16) }}
            stroke={1.5}
          />
        }
        rightSection={
          searchQuery ? (
            <ActionIcon
              onClick={clearSearch}
              variant="transparent"
              aria-label="Clear search"
            >
              <IconX />
            </ActionIcon>
          ) : null
        }
        value={searchQuery}
        onChange={(event) => {
          const value = event.currentTarget.value;
          setSearchQuery(value);
          debouncedHandleSearch(value);
        }}
      />
      <Pagination
        total={Math.ceil(totalCount / PAGE_SIZE)}
        value={Number(searchParams.get("page") ?? 1)}
        onChange={updatePage}
      />
    </Group>
  );
}
