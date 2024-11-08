import { Breadcrumbs, Anchor } from "@mantine/core";
import Link from "next/link";

export function ProjectBreadcrumbs() {
  const items = [{ label: "Projects", href: "/portal/projects" }];

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
