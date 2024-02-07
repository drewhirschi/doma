"use client";

import { Button, MantineColorsTuple, createTheme } from "@mantine/core";

const blue: MantineColorsTuple = [
  '#ebf3ff',
  '#d8e2f7',
  '#afc2eb',
  '#82a0e0',
  '#5e84d7',
  '#4672d2',
  '#3a69d0',
  '#2c58b9',
  '#234ea6',
  '#154393'
];

export const theme = createTheme({
  colors: {
    blue,
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        size: 'sm',
      },
    }),
  },
});
