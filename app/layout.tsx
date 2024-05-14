import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import "./global.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import { Analytics } from "@vercel/analytics/react"
import FacebookPixel from "@/components/FacebookPixel";
import { Notifications } from "@mantine/notifications";
import { theme } from "../theme";

export const metadata = {
  title: "Parsl",
  description: "Contract intelligence",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />

        

              <link rel="shortcut icon" href="/logo.svg" />
              <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
              />
              <meta name="msvalidate.01" content="107AE4ACC58FF672DBC6CF79BCEA3965" />
            </head>
            <body >
              <MantineProvider theme={theme}>
                <Notifications />
                {children}
              </MantineProvider>
              <Analytics />
              <FacebookPixel />
            </body>
          </html>
          );
}
