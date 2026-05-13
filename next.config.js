/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure YAML config files are bundled with serverless functions
  outputFileTracingIncludes: {
    '**': ['./config/**'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'adherix-health.vercel.app' }],
        destination: 'https://adherixhealth.com/:path*',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;