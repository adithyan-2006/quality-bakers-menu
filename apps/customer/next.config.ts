import type { NextConfig } from 'next';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const nextConfig: NextConfig = {
  transpilePackages: ['@qbm/ui', '@qbm/config', '@qbm/types', '@qbm/validators'],
  serverExternalPackages: ['@prisma/client', '@qbm/database'],
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;
