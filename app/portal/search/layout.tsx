import {
  Stack,
  Table,
  TableTbody,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import AiSearch from "./AiSearch";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack m="sm">
      <AiSearch />

      {children}
    </Stack>
  );
}
