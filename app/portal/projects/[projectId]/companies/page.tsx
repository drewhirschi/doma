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
import {
  IconAlertCircle,
  IconChevronLeft,
  IconExternalLink,
  IconFileArrowLeft,
  IconHome,
  IconMessageCircle,
  IconPhoto,
  IconSettings,
} from "@tabler/icons-react";

import { AddCompaniesPanel } from "./AddCompaniesPanel";
import Link from "next/link";
import { RemoveCompaniesDialog } from "./RemoveCompaniesDialog";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { serverClient } from "@/shared/supabase-client/server";
import { useSBFetch } from "@/ux/hooks";
import { useState } from "react";
import Loading from "@/ux/components/Loading";

export default function Page({ params }: { params: { projectId: string } }) {
  const supabase = browserClient();
  const {
    data: project,
    error,
    loading,
  } = useSBFetch(() =>
    supabase
      .from("ib_projects")
      .select("*, model_cmp(*), company_profile!deal_comps(*) ")
      .eq("id", params.projectId)
      .single(),
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  if (error) {
    return <p>Error</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  const toggleRow = (id: number) => {
    setSelectedRows((current) =>
      current.includes(id)
        ? current.filter((rowId) => rowId !== id)
        : [...current, id],
    );
  };

  const rows = project!.company_profile?.map((element) => (
    <TableTr
      key={element.id}
      onClick={() => toggleRow(element.id)}
      bg={
        selectedRows.includes(element.id)
          ? "var(--mantine-color-blue-light)"
          : undefined
      }
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
        />
      </TableTd>
      <TableTd>
        <Group>
          {element.favicon != null && (
            <Image src={element.favicon} width={16} height={16} />
          )}
          <Anchor
            c={"dark"}
            fw={500}
            component={Link}
            href={`/portal/companies/${element.id}/overview`}
          >
            {element.name || element.origin}
          </Anchor>
        </Group>
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
              <IconExternalLink size={20} />
            </ActionIcon>
          )}
        </Group>
      </TableTd>
    </TableTr>
  ));

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Group justify="end">
        <AddCompaniesPanel />
        <RemoveCompaniesDialog
          selectedCompanies={selectedRows}
          projectId={params.projectId}
          onRemoveSuccess={() => setSelectedRows([])}
        />
      </Group>
      <Table
        highlightOnHover
        highlightOnHoverColor="var(--mantine-color-blue-light)"
      >
        <TableThead>
          <TableTr>
            <TableTh></TableTh>
            <TableTh>Name</TableTh>
            <TableTh>Website</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
      {/* <CompanyProfile companyId={cmpId} /> */}
    </>
  );
}
