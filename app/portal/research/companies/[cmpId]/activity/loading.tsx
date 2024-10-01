import { Container, Skeleton, Space, Table } from "@mantine/core";

export default function Loading() {
  return (
    <Container>
      <Space />
      <Skeleton height={16} mt={6} radius="xl" />
      <Skeleton height={16} mt={6} radius="xl" />
    </Container>
  );
}
