"use client";

import { useEffect, useState } from "react";

import Script from "next/script";
import { usePathname } from "next/navigation";

const pixel = {

    pageview: () => {
        window.fbq("track", "PageView");
    },
    
    // https://developers.facebook.com/docs/facebook-pixel/advanced/
    event: (name:string, options = {}) => {
        window.fbq("track", name, options);
    },
    FB_PIXEL_ID: "905081251117190",
}

const FacebookPixel = () => {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!loaded) return;

    pixel.pageview();
  }, [pathname, loaded]);

  return (
    <div>
      <Script
        id="fb-pixel"
        src="/scripts/pixel.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        data-pixel-id={pixel.FB_PIXEL_ID}
      />
    </div>
  );
};

export default FacebookPixel;