import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // basePath: "/fih",
  env: {
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;