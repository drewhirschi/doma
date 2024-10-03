import { Breadcrumbs, Anchor } from "@mantine/core";
import Link from "next/link";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export function BreadcrumbsComponent({ items }: BreadcrumbsProps) {
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
