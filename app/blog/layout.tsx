import { Box } from "@mantine/core";
import TopNav from "@/components/TopNav";

export default function Layout({
   children,
}: {
   children: React.ReactNode;
}) {
    return <Box >
        <TopNav />

        {children}
        </Box>;
}