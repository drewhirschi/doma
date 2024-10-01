"use client";

import { Button, MantineColorsTuple, Title, createTheme } from "@mantine/core";

const blue: MantineColorsTuple = [
  "#ebf3ff",
  "#d8e2f7",
  "#afc2eb",
  "#82a0e0",
  "#5e84d7",
  "#4672d2",
  "#3a69d0",
  "#2c58b9",
  "#234ea6",
  "#154393",
];

export const theme = createTheme({
  // fontFamily: "Inter, Poppins",
  colors: {
    blue,
  },

  fontSizes: {
    xl: "24px",
  },

  components: {
    Title: Title.extend({
      defaultProps: {
        // fw: 400
      },
    }),
    Button: Button.extend({
      // defaultProps: {
      //   size: 'sm',
      //   variant: "gradient",
      //   gradient: {"deg":30, from: "blue.8", to: "blue.6"},
      //   fw: 500
      // },
    }),
  },
});
