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
};

module.exports = nextConfig;
