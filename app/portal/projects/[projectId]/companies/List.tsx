"use client";

import {
  ActionIcon,
  Anchor,
  Checkbox,
  Group,
  Image,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

import { AddCompaniesPanel } from "./AddCompaniesPanel";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { RemoveCompaniesDialog } from "./RemoveCompaniesDialog";
import { SimilarityBadge } from "../../../companies/[cmpId]/companies/SimilarityBadge";
import { useState } from "react";

interface CompanyWithSimilarity {
  id: number;
  name: string;
  origin: string;
  similarity: number;
}

export default function CompanyList({
  project,
  companies,
}: {
  project: IBProject_SB;
  companies: CompanyWithSimilarity[];
}) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setSelectedRows((current) => (current.includes(id) ? current.filter((rowId) => rowId !== id) : [...current, id]));
  };

  const rows = companies?.map((element) => (
    <TableTr
      key={element.id}
      onClick={() => toggleRow(element.id)}
      bg={selectedRows.includes(element.id) ? "var(--mantine-color-blue-light)" : undefined}
    >
      <TableTd>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(element.id)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, element.id]
                : selectedRows.filter((position) => position !== element.id),
            )
          }
          styles={{
            root: { cursor: "pointer" },
            input: { cursor: "pointer" },
            label: { cursor: "pointer" },
          }}
        />
      </TableTd>
      <TableTd>
        <Group>
          <Anchor c={"dark"} fw={500} component={Link} href={`/portal/companies/${element.id}/overview`}>
            {element.name || element.origin}
          </Anchor>
        </Group>
      </TableTd>

      <TableTd>
        <SimilarityBadge similarity={element.similarity ?? 0} />
      </TableTd>
      <TableTd>{element.origin}</TableTd>

      <TableTd>
        <Group>
          {element.origin && (
            <ActionIcon
              p={"xs"}
              variant="subtle"
              component={Link}
              href={element.origin}
              size="xl"
              aria-label="Open in a new tab"
            >
              <IconExternalLink size={20} color="black" />
            </ActionIcon>
          )}
        </Group>
      </TableTd>
    </TableTr>
  ));

  return (
    <>
      <Group justify="end">
        <AddCompaniesPanel />
        <RemoveCompaniesDialog
          selectedCompanies={selectedRows}
          projectId={project.id}
          onRemoveSuccess={() => setSelectedRows([])}
        />
      </Group>
      <Table highlightOnHover highlightOnHoverColor="var(--mantine-color-blue-light)">
        <TableThead>
          <TableTr>
            <TableTh style={{ width: "5%" }}></TableTh>
            <TableTh style={{ width: "35%" }}>Name</TableTh>
            <TableTh style={{ width: "35%" }}>Similarity</TableTh>
            <TableTh style={{ width: "60%" }}>Website</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </>
  );
}
