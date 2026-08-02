/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@qbm/ui', '@qbm/config', '@qbm/types', '@qbm/validators'],
  reactStrictMode: true,
};

export default nextConfig;
