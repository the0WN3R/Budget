/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure API routes work correctly
  async rewrites() {
    return []
  },
  // Configure webpack to properly handle Supabase ESM
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add .mjs to module extensions
      config.resolve.extensions.push('.mjs')
      
      // Ensure proper handling of ESM modules
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      })
    }
    return config
  },
}

module.exports = nextConfig
