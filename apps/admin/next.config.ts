/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@qbm/ui', '@qbm/config', '@qbm/types', '@qbm/validators', 'customer'],
  reactStrictMode: true,
};

export default nextConfig;
