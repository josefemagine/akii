/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure rewrites to direct /api/bedrock paths to pages/api/bedrock
  async rewrites() {
    return [
      {
        source: '/api/bedrock',
        destination: '/api/bedrock-next',
      },
      {
        source: '/api/bedrock/:path*',
        destination: '/api/bedrock-next/:path*',
      },
    ];
  },
  
  // Disable @vercel/node ESM Node.js build so we can control module resolution
  experimental: {
    outputFileTracingExcludes: {
      '/api/bedrock/**': true,
    }
  },
  
  // Configure build environment variables
  env: {
    BEDROCK_API_KEY: process.env.BEDROCK_API_KEY,
    VITE_BEDROCK_API_URL: 'https://www.akii.com/api/bedrock',
  },
};

module.exports = nextConfig; 