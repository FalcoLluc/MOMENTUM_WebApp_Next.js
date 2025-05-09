import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  }, 
  output: "standalone",
  images: {
    domains: ['tile.openstreetmap.org'],
  },
  reactStrictMode: true,
};

export default nextConfig;
