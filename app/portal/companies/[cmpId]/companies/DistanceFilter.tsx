"use client";

import { Checkbox, Group, Select } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DistanceFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function updateDistance(value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("distance", value);
    } else {
      params.delete("distance");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  function updateDistanceFilter(value: boolean) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("distanceFilter", value.toString());
    } else {
      params.delete("distanceFilter");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Group align="baseline">
      <Checkbox
        label="Filter By Location"
        checked={searchParams.get("distanceFilter") === "true"}
        onChange={(event) => updateDistanceFilter(event.currentTarget.checked)}
        styles={{
          root: { cursor: "pointer" },
          input: { cursor: "pointer" },
          label: { cursor: "pointer" },
        }}
      />
      <Select
        value={String(searchParams.get("distance") ?? 15000)}
        onChange={updateDistance}
        data={[
          { value: "5", label: "5 miles" },
          { value: "10", label: "10 miles" },
          { value: "25", label: "25 miles" },
          { value: "50", label: "50 miles" },
          { value: "100", label: "100 miles" },
          { value: "500", label: "500 miles" },
          { value: "15000", label: "All Locations" },
        ]}
        disabled={searchParams.get("distanceFilter") !== "true"}
      />
    </Group>
  );
}
