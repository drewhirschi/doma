"use client";

import { useEffect, useState } from "react";

import Script from "next/script";
import { fbPixel } from "@/ux/helper";
import { usePathname } from "next/navigation";

const FacebookPixel = () => {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!loaded) return;

    fbPixel.pageview();
  }, [pathname, loaded]);

  return (
    <div>
      <Script
        id="fb-pixel"
        src="/scripts/pixel.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        data-pixel-id={fbPixel.FB_PIXEL_ID}
      />
    </div>
  );
};

export default FacebookPixel;
