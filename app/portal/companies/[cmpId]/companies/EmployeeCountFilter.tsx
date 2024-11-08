"use client";

import { Checkbox, Group, MultiSelect, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function EmployeeCountFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [numEmployees, setEmployees] = useState<string[]>(searchParams.get("employeeCount")?.split(",") ?? []);

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
        placeholder="Company Size"
        // value={searchParams.get("employeeCount")?.split(",") ?? []}
        value={numEmployees}
        onChange={setEmployees}
        data={[
          //   { value: "none", label: "All Employee counts" },
          { value: "2 - 10", label: "2-10" },
          { value: "11 - 50", label: "11-50" },
          { value: "51 - 200", label: "51-200" },
          { value: "201 - 500", label: "201-500" },
          { value: "501 - 1000", label: "501-1000" },
          { value: "1001 - 5000", label: "1001-5000" },
          { value: "5001 - 10000", label: "5001-10000" },
          { value: "10001+", label: "10001+" },
        ]}
      />
    </Group>
  );
}
