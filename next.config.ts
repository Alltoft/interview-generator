import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['gsap'],
  },
}

export default config
