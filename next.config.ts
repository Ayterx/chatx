import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
    reactCompiler: true,
    viewTransition: true
  }
}

export default nextConfig
