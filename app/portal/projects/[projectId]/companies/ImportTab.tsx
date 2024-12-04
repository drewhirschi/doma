"use client";

import { Box, Button, FileInput, Group, Stack, rem } from "@mantine/core";
import React, { useState } from "react";

import { IconFileSpreadsheet } from "@tabler/icons-react";
import { browserClient } from "@/ux/supabase-client/BrowserClient";
import { queueCompanyProfiling } from "./actions";

interface IImportTabProps {
  projectId: number;
}

export default function ImportTab({ projectId }: IImportTabProps) {
  const [file, setValue] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const XLSX = await import("xlsx");

      const fileExtension = file!.name.split(".").pop()?.toLowerCase();

      let websiteColumnValues: string[] = [];

      if (fileExtension === "xlsx") {
        const data = await file!.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<{ Website: string }>(worksheet);

        websiteColumnValues = jsonData.map((row) => row.Website).filter(Boolean);
      } else if (fileExtension === "csv") {
        const data = await file!.text();
        const parsedData = XLSX.utils.sheet_to_json<{ website: string }>(
          XLSX.read(data, { type: "string" }).Sheets.Sheet1,
        );

        websiteColumnValues = parsedData.map((row) => row.website).filter(Boolean);
      }

      console.log(websiteColumnValues);

      const supabase = browserClient();

      const rows = websiteColumnValues.map((url) => ({
        origin: "https://" + url,
      }));

      const { data: newCompanies, error } = await supabase
        .from("company_profile")
        .upsert(rows, { onConflict: "origin", ignoreDuplicates: true })
        .select();

      if (error) {
        console.error("Failed to upsert companies", error);
        throw error;
      }

      await queueCompanyProfiling(newCompanies.map((cmp) => cmp.id));

      const companiesGet = await supabase
        .from("company_profile")
        .select()
        .in(
          "origin",
          rows.map((r) => r.origin),
        );

      if (companiesGet.error) {
        console.error("Failed to get companies", companiesGet.error);
        throw companiesGet.error;
      }

      const assignToProject = await supabase.from("deal_comps").upsert(
        companiesGet.data.map((cmp) => ({
          project_id: projectId,
          cmp_id: cmp.id,
        })),
      );

      if (assignToProject.error) {
        console.error("Failed to assign companies to project", assignToProject.error);
        throw assignToProject.error;
      }
    } catch (error) {
      console.error("Failed to import XLSX module or process file", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack>
        <FileInput
          leftSection={<IconFileSpreadsheet style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
          label="Choose file"
          description="File type: .csv or .xlsx"
          placeholder="Click to select a file"
          accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          clearable
          value={file}
          onChange={setValue}
        />
        <Group justify="flex-end">
          <Button disabled={!file} loading={loading} onClick={onSubmit}>
            Import
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
