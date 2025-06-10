import type { NextConfig } from "next"

import "./src/env"

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
    ppr: true,
    reactCompiler: true,
    viewTransition: true
  }
}

export default nextConfig
