/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@workspace/ui', '@workspace/types'],
};

module.exports = nextConfig;
