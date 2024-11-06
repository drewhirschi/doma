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

  return (
    <Group align="baseline">
      <Select
        value={String(searchParams.get("distance") ?? "none")}
        onChange={updateDistance}
        data={[
          { value: "none", label: "All Locations" },
          { value: "5", label: "5 miles" },
          { value: "10", label: "10 miles" },
          { value: "25", label: "25 miles" },
          { value: "50", label: "50 miles" },
          { value: "100", label: "100 miles" },
          { value: "500", label: "500 miles" },
        ]}
      />
    </Group>
  );
}
