"use client";

import { Checkbox, Group, MultiSelect, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function EmployeeCountFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [numEmployees, setEmployees] = useState<string[]>(
    searchParams.get("employeeCount")?.split(",") ?? [],
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (numEmployees.length) {
      params.set("employeeCount", numEmployees.join());
    } else {
      params.delete("employeeCount");
    }
    replace(`${pathname}?${params.toString()}`);
  }, [numEmployees]);

  return (
    <Group align="baseline">
      <MultiSelect
        maw={500}
        placeholder="Employee ranges"
        // value={searchParams.get("employeeCount")?.split(",") ?? []}
        value={numEmployees}
        onChange={setEmployees}
        data={[
          //   { value: "none", label: "All Employee counts" },
          { value: "1-10", label: "1-10" },
          { value: "11-20", label: "11-20" },
          { value: "21-50", label: "21-50" },
          { value: "51-100", label: "51-100" },
          { value: "101-200", label: "101-200" },
          { value: "201-500", label: "201-500" },
          { value: "501-1000", label: "501-1000" },
          { value: "1001-2000", label: "1001-2000" },
          { value: "2001-5000", label: "2001-5000" },
          { value: "5001-10000", label: "5001-10000" },
          { value: "10001+", label: "10001+" },
        ]}
      />
    </Group>
  );
}
