import { Button } from "@mantine/core";
import type { SVGProps } from "react";
import { browserClient } from "@/ux/supabase-client/BrowserClient";

const MicrosoftLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    preserveAspectRatio="xMidYMid"
    {...props}
  >
    <path fill="#F1511B" d="M121.666 121.666H0V0h121.666z" />
    <path fill="#80CC28" d="M256 121.666H134.335V0H256z" />
    <path fill="#00ADEF" d="M121.663 256.002H0V134.336h121.663z" />
    <path fill="#FBBC09" d="M256 256.002H134.335V134.336H256z" />
  </svg>
);
interface Props {
  authCallbackUrl: string;
}
export default function MicrosoftButton(props: Props) {
  return (
    <Button
      variant="default"
      rightSection={<MicrosoftLogo />}
      onClick={async () => {
        const supabase = browserClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "azure",
          options: {
            scopes: "openid, profile, email",
            redirectTo: props.authCallbackUrl,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
      }}
    >
      Sign in with Microsoft
    </Button>
  );
}
