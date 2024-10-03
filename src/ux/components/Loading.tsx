import { Center, Group, Skeleton, Stack, Loader } from "@mantine/core";

const Loading = () => {
  return (
    // <Stack>
    //   <Group>
    //     <Skeleton height={8} radius="md" />
    //     <Skeleton height={8} radius="md" />
    //     <Skeleton height={8} radius="md" />
    //     <Skeleton height={8} radius="md" />
    //   </Group>
    //   <Skeleton height={8} radius="md" />
    //   <Skeleton height={8} radius="md" />
    //   <Skeleton height={8} radius="md" />
    //   <Skeleton height={8} radius="md" />
    // </Stack>
    <Center style={{ height: "100vh" }}>
      <Loader size="lg" variant="dots" />
    </Center>
  );
};

export default Loading;
