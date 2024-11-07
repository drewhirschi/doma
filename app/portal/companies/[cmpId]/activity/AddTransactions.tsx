"use client";

import { actionWithNotification } from "@/ux/clientComp";
import { Button, Center, Stack, Text, Paper } from "@mantine/core";
import { useState } from "react";
import { queueArticleScraping } from "../overview/actions";

export default function AddTransactions({ cmpId }: { cmpId: number }) {
  const [showNotification, setShowNotification] = useState(false);

  const handleScraping = async () => {
    await actionWithNotification(async () => {
      await queueArticleScraping(cmpId);
    });

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  return (
    <Center>
      <Stack mt="lg" mb="lg">
        <Button variant="default" size="compact-lg" onClick={handleScraping}>
          Find Transactions
        </Button>
      </Stack>

      {showNotification && (
        <Center
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
        >
          <Paper
            shadow="xl"
            radius="lg"
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <Text size="lg" fw={600}>
              Scraping in Progress
            </Text>
            <Text size="md" mt="sm">
              Check back in several minutes for new transactions!
            </Text>
          </Paper>
        </Center>
      )}
    </Center>
  );
}
