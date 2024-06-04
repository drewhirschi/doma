import { Group, Pagination, TextInput, rem } from "@mantine/core";
import { IconSearch, IconSettings } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams, } from 'next/navigation';

import { FilterPopover } from "./overview/Filter";
import { PAGE_SIZE } from "./shared";
import { useDebouncedCallback } from "use-debounce";

export function SearchAndPage({totalCount,}:{totalCount: number}) {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const debouncedHandleSearch = useDebouncedCallback((value: string) => {
        //@ts-ignore
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.delete('page');
            params.set('query', value);
        } else {
            params.delete('query');
        }
        console.log("?" +params.toString())
        replace(`${pathname}?${params.toString()}`);
    }, 300)

    function updatePage(value: number) {
        //@ts-ignore
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('page', value.toString());
        } else {
            params.delete('page');
        }

        replace(`${pathname}?${params.toString()}`);
    }

    return (

        <Group align="baseline">

            <TextInput
                w={200}
                placeholder="Search"
                mb="md"
                leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(event) => debouncedHandleSearch(event.currentTarget.value)}
            />
            <Pagination total={totalCount / PAGE_SIZE} value={Number(searchParams.get("page") ?? 1)} onChange={updatePage} />
            <FilterPopover  />
        </Group>
    )
}