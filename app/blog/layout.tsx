import { Box } from "@mantine/core";

export default function Layout({
   children,
}: {
   children: React.ReactNode;
}) {
    return <Box >{children}</Box>;
}