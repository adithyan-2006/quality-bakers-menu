/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@qbm/ui', '@qbm/config', '@qbm/types', '@qbm/validators'],
  serverExternalPackages: ['@prisma/client', '@qbm/database'],
  reactStrictMode: true,
};

export default nextConfig;
