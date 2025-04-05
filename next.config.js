/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure rewrites to direct /api/bedrock paths to pages/api/bedrock-next
  async rewrites() {
    return [
      // Add super-action route explicitly to ensure it's properly handled
      {
        source: '/api/super-action',
        destination: '/api/super-action',
      },
      {
        source: '/api/bedrock',
        destination: '/api/bedrock-next',
      },
      {
        source: '/api/bedrock/instances',
        destination: '/api/bedrock-next/instances',
      },
      {
        source: '/api/bedrock/provision-instance',
        destination: '/api/bedrock-next/provision-instance',
      },
      {
        source: '/api/bedrock/delete-instance',
        destination: '/api/bedrock-next/delete-instance',
      },
      {
        source: '/api/bedrock/test-env',
        destination: '/api/bedrock-next/test-env',
      },
    ];
  },
  
  // Disable @vercel/node ESM Node.js build so we can control module resolution
  experimental: {
    outputFileTracingExcludes: {
      '/api/bedrock/**': true,
      '/api/super-action/**': true,
    }
  },
  
  // Configure build environment variables
  env: {
    BEDROCK_API_KEY: process.env.BEDROCK_API_KEY,
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_BEDROCK_API_URL: '/api/super-action',
    USE_MOCK_SUPER_ACTION: process.env.USE_MOCK_SUPER_ACTION || 'true',
  },
};

module.exports = nextConfig; 