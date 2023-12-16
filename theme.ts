"use client";

import { Button, createTheme } from "@mantine/core";

export const theme = createTheme({
  components: {
    Button: Button.extend({
      defaultProps: {
        size: 'sm',
      },
    }),
  },
});
