"use client";

import {
  Box,
  Button,
  Center,
  Checkbox,
  Drawer,
  FileInput,
  Group,
  SegmentedControl,
  Stack,
  Table,
  TextInput,
  rem,
} from "@mantine/core";
import { IconFileImport, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import ImportTab from "./ImportTab";
import { actionWithNotification } from "@/ux/clientComp";
import { addCompaniesToProject } from "./actions";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { useDebouncedCallback } from "use-debounce";
import { useDisclosure } from "@mantine/hooks";
import { useParams } from "next/navigation";

interface Props {}
export function AddCompaniesPanel(props: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [tab, setTab] = useState("doma");
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

        <SegmentedControl
          fullWidth
          value={tab}
          onChange={setTab}
          data={[
            {
              value: "doma",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconPlus style={{ width: rem(16), height: rem(16) }} />
                  <span>Add</span>
                </Center>
              ),
            },
            {
              value: "import",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconFileImport style={{ width: rem(16), height: rem(16) }} />
                  <span>Import</span>
                </Center>
              ),
            },
          ]}
          mb={"sm"}
        />
        {tab === "doma" && (
          <Box>
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
                radius="sm"
                variant="gradient"
                gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
              >
                Save
              </Button>
            </Group>
          </Box>
        )}
        {tab === "import" && <ImportTab projectId={Number(projectId)} />}
      </Drawer>
      <Button
        variant="subtle"
        leftSection={<IconPlus />}
        onClick={open}
        mt="md"
        radius="sm"
        gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
      >
        Add Companies
      </Button>
    </>
  );
}
