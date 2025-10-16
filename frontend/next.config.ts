import type { NextConfig } from 'next';

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env['ANALYZE'] === 'true',
});

const nextConfig: NextConfig = {
  // Workspace configuration
  outputFileTracingRoot: process.cwd(),
  
  // Docker production build
  output: 'standalone',

  // Build optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@tanstack/react-table',
      'recharts'
    ],
  },

  // Disable cache in production builds
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  // Webpack optimizations for bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Split heavy libraries into separate chunks
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate chunk for drag-and-drop libraries
          dndkit: {
            test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
            name: 'dnd-kit',
            chunks: 'all',
            priority: 30,
          },
          // Separate chunk for table library
          reactTable: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]react-table[\\/]/,
            name: 'react-table',
            chunks: 'all',
            priority: 30,
          },
          // Separate chunk for charts
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 30,
          },
          // Radix UI components
          radixui: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }
    return config;
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
