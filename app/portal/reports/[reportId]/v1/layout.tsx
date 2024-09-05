import { Box, Container } from "@mantine/core";

export default function Layout({
   children,
}: {
   children: React.ReactNode;
}) {
    return <Box h="100%" mih={"100vh"} bg={"gray.0"}>


            {children}
    </Box>;
}