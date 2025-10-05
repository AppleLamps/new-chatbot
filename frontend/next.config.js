/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Fix workspace root warning by pointing to the monorepo root
  outputFileTracingRoot: path.join(__dirname, '..'),
  
  async rewrites() {
    // Use environment variable for API base URL, defaulting to port 4000
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
    
    return [
      {
        source: '/api/chat',
        destination: `${apiBaseUrl}/api/chat`,
      },
      {
        source: '/api/chat/stream',
        destination: `${apiBaseUrl}/api/chat/stream`,
      },
      {
        source: '/api/suggestions',
        destination: `${apiBaseUrl}/api/suggestions`,
      },
      {
        source: '/api/upload',
        destination: `${apiBaseUrl}/api/upload`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
