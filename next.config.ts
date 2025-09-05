import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use default output for dynamic routes
  // output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // ESLint configuration for production
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for production
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable static generation for admin routes
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Headers for security
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
