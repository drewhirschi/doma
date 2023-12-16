"use client"

import { Container, Space, Tabs } from '@mantine/core';

export default function ContractView({contract}:{contract:any}) {
  return (<Container>
    <Tabs defaultValue="pdf" mt={"lg"}>
      <Tabs.List>
        <Tabs.Tab value="pdf">PDF</Tabs.Tab>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="pdf">
        Gallery tab content
      </Tabs.Panel>

      <Tabs.Panel value="messages">
        Messages tab content
      </Tabs.Panel>

      <Tabs.Panel value="settings">
        Settings tab content
      </Tabs.Panel>
    </Tabs>
  </Container>
  );
}