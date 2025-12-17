/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure API routes work correctly
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
