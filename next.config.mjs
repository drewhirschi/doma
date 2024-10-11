/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  experimental: {
    turbo: {
      rules: {
        // "*.svg": {
        //   loaders: ["@svgr/webpack"],
        //   as: "*.js",
        // },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
        port: "",
      },
    ],
  },
};

export default nextConfig;
