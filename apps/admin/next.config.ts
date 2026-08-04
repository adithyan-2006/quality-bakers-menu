/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@qbm/ui', '@qbm/config', '@qbm/types', '@qbm/validators', 'customer'],
  serverExternalPackages: ['cloudinary'],
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
