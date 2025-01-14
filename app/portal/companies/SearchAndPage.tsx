"use client";

import { ActionIcon, Group, Pagination, TextInput, rem } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PAGE_SIZE } from "./[cmpId]/shared";
import { useDebouncedCallback } from "use-debounce";

interface SearchAndPageProps {
  totalCount: number;
  hidePagination?: boolean;
}

export function SearchAndPage({ totalCount, hidePagination = false }: SearchAndPageProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("query") ?? "");

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
        placeholder="Search by name or website"
        leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
        rightSection={
          searchQuery ? (
            <ActionIcon onClick={clearSearch} variant="transparent" aria-label="Clear search">
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
      {!hidePagination && (
        <Pagination
          total={Math.ceil(totalCount / PAGE_SIZE)}
          value={Number(searchParams.get("page") ?? 1)}
          onChange={updatePage}
        />
      )}
    </Group>
  );
}
