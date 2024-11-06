"use client";

import { Button, Checkbox, Drawer, Group, Table, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

import { IconPlus } from "@tabler/icons-react";
import { actionWithNotification } from "@/ux/clientComp";
import { addCompaniesToProject } from "./actions";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { useDebouncedCallback } from "use-debounce";
import { useDisclosure } from "@mantine/hooks";
import { useParams } from "next/navigation";

interface Props {}
export function AddCompaniesPanel(props: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [companies, setCompanies] = useState<{ id: number; name: string | null; origin: string | null }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const debouncedSetSearchTerm = useDebouncedCallback(setSearchTerm, 500);
  const { projectId } = useParams();
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
    <Table.Tr key={cmp.name} bg={selectedRows.includes(cmp.id) ? "var(--mantine-color-blue-light)" : undefined}>
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(cmp.id)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, cmp.id]
                : selectedRows.filter((position) => position !== cmp.id),
            )
          }
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

        <TextInput placeholder="Search by name" onChange={(e) => debouncedSetSearchTerm(e.currentTarget.value)} />

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
        <Group justify="flex-end">
          <Button
            disabled={selectedRows.length === 0}
            onClick={async () => {
              actionWithNotification(() => addCompaniesToProject(Number(projectId), selectedRows));
              close();
              setSearchTerm("");
            }}
          >
            Save
          </Button>
        </Group>
      </Drawer>
      <Button
        variant="subtle"
        leftSection={<IconPlus />}
        onClick={open}
        mt="md"
        radius="sm"
        gradient={{ deg: 30, from: "red.8", to: "red.6" }}
      >
        Add Companies
      </Button>
    </>
  );
}
