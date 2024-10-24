"use client";

import { actionWithNotification } from "@/ux/clientComp";
import { Button, Center, Stack, Title } from "@mantine/core";
import { queueArticleScraping } from "../../../app/portal/companies/[cmpId]/overview/actions";

export default function AddTransactions({ cmpId }: { cmpId: number }) {
  const handleScraping = async () => {
    await actionWithNotification(async () => {
      await queueArticleScraping(cmpId);
    });
  };

  return (
    <Center>
      <Stack mt={"sm"}>
        <Title order={3} ta={"center"}>
          No Transactions Found
        </Title>
        <Button variant="default" size="compact-md" onClick={handleScraping}>
          Find Recent Transactions
        </Button>
      </Stack>
    </Center>
  );
}
