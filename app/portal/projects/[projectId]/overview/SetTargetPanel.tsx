import { Button, Checkbox, Drawer, Group, Table, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

import { EmptyCompanyListState } from "@/ux/components/CompanyList.EmptyState";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { useDebouncedCallback } from "use-debounce";
import { useDisclosure } from "@mantine/hooks";

interface Props {
  setCmpId: (id: number) => Promise<void>;
}

export function SetTargetPanel(props: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [companies, setCompanies] = useState<{ id: number; name: string | null; origin: string | null }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const debouncedSetSearchTerm = useDebouncedCallback(setSearchTerm, 500);

  const sb = browserClient();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);

      const searchIsNumber = !isNaN(Number(searchTerm)) && searchTerm;
      const orClause = `name.ilike.%${searchTerm}%,origin.ilike.%${searchTerm}%${searchIsNumber ? ",id.eq." + searchTerm : ""}`;

      const { data, error } = await sb
        .from("company_profile")
        .select("id, name, origin")
        .or(orClause)
        .limit(20)
        .order("name", { ascending: true });

      setLoading(false);

      if (error) {
        setError(true);
        return;
      }

      setCompanies(data);
    };

    if (opened) {
      fetchCompanies();
    }
  }, [opened, sb, searchTerm]);

  const rows = companies.map((cmp) => (
    <Table.Tr key={cmp.name} bg={selectedRow === cmp.id ? "var(--mantine-color-blue-light)" : undefined}>
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRow === cmp.id}
          onChange={(event) => setSelectedRow(event.currentTarget.checked ? cmp.id : null)}
        />
      </Table.Td>
      <Table.Td>{cmp.id}</Table.Td>
      <Table.Td>{cmp.name}</Table.Td>
      <Table.Td>{cmp.origin}</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Set Target" position="right" size={"lg"}>
        {error && <p>Error</p>}
        {loading && <p>Loading...</p>}

        <TextInput placeholder="Search by name or ID" onChange={(e) => debouncedSetSearchTerm(e.currentTarget.value)} />

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Site</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        {companies.length === 0 && loading === false && <EmptyCompanyListState />}
        <Group justify="flex-end">
          <Button
            disabled={selectedRow === null}
            onClick={async () => {
              if (selectedRow !== null) {
                await props.setCmpId(selectedRow);
                close();
                setSearchTerm("");
                setSelectedRow(null);
              }
            }}
            radius="sm"
            variant="gradient"
            gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
          >
            Save
          </Button>
        </Group>
      </Drawer>

      <Button
        size="sm"
        onClick={open}
        radius="sm"
        variant="gradient"
        gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
      >
        Change
      </Button>
    </>
  );
}
