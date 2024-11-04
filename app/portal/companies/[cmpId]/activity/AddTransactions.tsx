"use client";

import { actionWithNotification } from "@/ux/clientComp";
import { Button, Center, Stack, Title } from "@mantine/core";
import { queueArticleScraping } from "../overview/actions";

export default function AddTransactions({ cmpId }: { cmpId: number }) {
  const handleScraping = async () => {
    await actionWithNotification(async () => {
      await queueArticleScraping(cmpId);
    });
  };

  return (
    <Center>
      <Stack mt="lg" mb="lg">
        <Button variant="default" size="compact-lg" onClick={handleScraping}>
          Find Transactions
        </Button>
      </Stack>
    </Center>
  );
}
