import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://i.pinimg.com/**"),
      new URL("https://iili.io/"),
    ],
  },
};

export default nextConfig;
