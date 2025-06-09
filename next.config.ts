import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
    ppr: true,
    reactCompiler: true,
    viewTransition: true
  }
}

export default nextConfig
