import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "@phosphor-icons/react/dist/ssr": "@phosphor-icons/react",
    },
  },
};

export default nextConfig;
