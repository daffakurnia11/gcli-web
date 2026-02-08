import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_FIVEM_ASSETS_URL: process.env.FIVEM_ASSETS_URL,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/**" },
      { protocol: "https", hostname: "iili.io", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/api/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "assets.gclindonesia.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "assets.gclindonesia.com",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**"],
  },
};

export default nextConfig;
