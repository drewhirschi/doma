"use client";

import {
  ActionIcon,
  Anchor,
  Button,
  Checkbox,
  Group,
  Image,
  Select,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { AddToDealModal } from "./AddToDealModal";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { PAGE_SIZE } from "../shared";
import { SearchAndPage } from "../../SearchAndPage";
import { SimilarityBadge } from "./SimilarityBadge";
import { browserClient } from "@/ux/supabase-client/BrowserClient";

interface CompanyWithSimilarity extends CompanyProfile_SB {
  similarity: number;
}

export default function Page({
  params,
  searchParams,
}: {
  params: { cmpId: string };
  searchParams: { query?: string; page?: string; cmpId: string };
}) {
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [sortedCompanies, setSortedCompanies] = useState<
    CompanyWithSimilarity[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const query = searchParams.query || "";
  const page = Number(searchParams.page) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  const searchIsNumber = !isNaN(Number(query)) && query;
  const orClause = `name.ilike.%${query}%,origin.ilike.%${query}%${
    searchIsNumber ? ",id.eq." + query : ""
  }`;

  const handleCheckboxChange = (companyId: number) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const [selectedDistance, setSelectedDistance] = useState<number | string>(
    15000,
  );
  const [distanceFilterEnabled, setDistanceFilterEnabled] = useState(false);

  const handleDistanceChange = (value: string | number) => {
    setSelectedDistance(value);
  };

  const handleFilterToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDistanceFilterEnabled(event.currentTarget.checked);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const supabase = browserClient();

      const companyGet = await supabase
        .from("company_profile")
        .select("*")
        .eq("id", params.cmpId)
        .single();

      if (companyGet.error) {
        throw new Error(companyGet.error.message);
      }

      const modelCmp = companyGet.data;
      if (!modelCmp.web_summary_emb) return;

      let similarCompaniesGet;

      similarCompaniesGet = await supabase.rpc("match_and_nearby_cmp", {
        query_embedding: modelCmp.web_summary_emb!,
        lat: modelCmp.hq_lat ?? 0,
        long: modelCmp.hq_lon ?? 0,
        distance: Number(selectedDistance) * 1609.34,
        match_count: 100,
        apply_distance_filter: distanceFilterEnabled,
      });

      if (similarCompaniesGet.error || !similarCompaniesGet.data) {
        throw new Error(
          similarCompaniesGet.error?.message ||
            "No data found for match_and_nearby_cmp",
        );
      }

      const totalCount = similarCompaniesGet.data.length;
      setTotalCount(totalCount);

      const paginatedIds = similarCompaniesGet.data
        ? similarCompaniesGet.data
            .slice(offset, offset + PAGE_SIZE)
            .map((company) => company.id)
        : [];

      const companiesGet = await supabase
        .from("company_profile")
        .select("*")
        .or(orClause)
        .in("id", paginatedIds);

      if (companiesGet.error) {
        throw new Error(companiesGet.error.message);
      }

      const sortedCompanies = similarCompaniesGet.data
        .filter((c) => paginatedIds.includes(c.id))
        .map((c) => ({
          ...c,
          similarity: Number(c.similarity),
        }))
        .map((c) => {
          const company =
            companiesGet.data?.find((cmp) => cmp.id === c.id) ?? null;
          return company && "similarity" in c
            ? { ...company, similarity: c.similarity }
            : company;
        })
        .filter(
          (company): company is CompanyWithSimilarity => company !== null,
        );

      setSortedCompanies(sortedCompanies.slice(1));
      setLoading(false);
    };

    loadData();
  }, [page, query, params.cmpId, distanceFilterEnabled, selectedDistance]);

  const rows = sortedCompanies?.map((element) => (
    <TableTr key={element.id}>
      <TableTd>
        <Checkbox
          checked={selectedCompanies.includes(element.id)}
          onChange={() => handleCheckboxChange(element.id)}
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
      <TableTd>
        <SimilarityBadge similarity={element.similarity} />
      </TableTd>
      <TableTd>{element.description}</TableTd>
      <TableTd>
        {element.origin && (
          <Group>
            <Anchor href={element.origin} c={"dark"} target="_blank">
              {new URL(element.origin ?? "").hostname}
            </Anchor>
            <IconExternalLink size={16} />
          </Group>
        )}
      </TableTd>
    </TableTr>
  ));

  return (
    <>
      <Group mb="md" justify="flex-end">
        <AddToDealModal selectedCompanies={selectedCompanies} />
      </Group>
      <Group>
        <SearchAndPage totalCount={totalCount} />{" "}
        <Checkbox
          label="Filter Companies By Location"
          checked={distanceFilterEnabled}
          onChange={handleFilterToggle}
        />
        <Select
          value={String(selectedDistance)}
          onChange={(value) => value !== null && handleDistanceChange(value)}
          data={[
            { value: "5", label: "5 miles" },
            { value: "10", label: "10 miles" },
            { value: "20", label: "20 miles" },
            { value: "50", label: "50 miles" },
            { value: "100", label: "100 miles" },
            { value: "500", label: "500 miles" },
            { value: "15000", label: "All Locations" },
          ]}
          disabled={!distanceFilterEnabled}
        />
      </Group>
      <Table>
        <TableThead>
          <TableTr>
            <TableTd>
              <Checkbox
                checked={selectedCompanies.length === sortedCompanies.length}
                onChange={() => {
                  if (selectedCompanies.length === sortedCompanies.length) {
                    setSelectedCompanies([]);
                  } else {
                    setSelectedCompanies(
                      sortedCompanies.map((company) => company.id),
                    );
                  }
                }}
                indeterminate={
                  selectedCompanies.length > 0 &&
                  selectedCompanies.length < sortedCompanies.length
                }
              />
            </TableTd>
            <TableTh>Name</TableTh>
            <TableTh>Relevance score</TableTh>
            <TableTh>Description</TableTh>
            <TableTh>Website</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </>
  );
}
