import type { NextConfig } from 'next';

// Cache Components (`cacheComponents`) stays off: content is fetched fresh on every request (see notes/decisions.md),
// the same rendering model as the CMS.
const nextConfig: NextConfig = {
  reactCompiler: true,
  // Stops `next dev` from writing its own instruction files into the repository.
  agentRules: false,
  poweredByHeader: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
