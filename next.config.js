/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure API routes work correctly
  async rewrites() {
    return []
  },
  // Transpile Supabase package for serverless compatibility
  transpilePackages: ['@supabase/supabase-js'],
}

module.exports = nextConfig
