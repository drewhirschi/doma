export const fbPixel = {
  pageview: () => {
    window.fbq("track", "PageView");
  },
  event: (name: string, options = {}) => {
    window.fbq("track", name, options);
  },
  FB_PIXEL_ID: "905081251117190",
};

export function getInitials(name: string): string {
  if (!name) {
    return "";
  }
  const words = name.split(" ");
  const initials = words.map((word) => word.charAt(0).toUpperCase());
  return initials.join("");
}
