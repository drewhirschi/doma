import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';
import "./global.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import { Analytics } from "@vercel/analytics/react"
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
        {/* <!-- Meta Pixel Code --> */}
        <script>
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '905081251117190');
          fbq('track', 'PageView');`}
        </script>
        <noscript>{`<img height="1" width="1" style="display:none"
          src="https://www.facebook.com/tr?id=905081251117190&ev=PageView&noscript=1"
        />`}</noscript>
        {/* <!-- End Meta Pixel Code --> */}
      </head>
      <body >
        <MantineProvider theme={theme}>
          <Notifications />
          {children}
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}
