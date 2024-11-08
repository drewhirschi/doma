"use client";

import { Breadcrumbs, Anchor } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BreadcrumbsComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [cmpId, setCmpId] = useState("");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const search = params.get("search") || "";
    const page = parseInt(params.get("page") || "1", 10);
    const cmpId = params.get("cmp") || "";

    setSearchTerm(search);
    setPage(page);
    setCmpId(cmpId);
  }, []);

  const items = [
    { label: "Home", href: "/portal/companies" },
    ...(!searchTerm && !cmpId && page > 1
      ? [
          {
            label: `Page ${page}`,
            href: `/portal/companies?page=${page}`,
          },
        ]
      : []),
    ...(searchTerm
      ? [
          {
            label: `Search Results`,
            href: `/portal/companies?query=${searchTerm}&page=${page}`,
          },
        ]
      : []),
    ...(cmpId
      ? [
          {
            label: `Companies`,
            href: `/portal/companies/${cmpId}/companies`,
          },
        ]
      : []),
  ];

  return (
    <Breadcrumbs>
      {items.map((item, index) => (
        <Anchor key={index} component={Link} href={item.href || "#"}>
          {item.label}
        </Anchor>
      ))}
    </Breadcrumbs>
  );
}
