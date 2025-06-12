import type { NextConfig } from "next"

import "./src/env"

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
    ppr: true,
    reactCompiler: true,
    viewTransition: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com"
      }
    ]
  }
}

export default nextConfig
