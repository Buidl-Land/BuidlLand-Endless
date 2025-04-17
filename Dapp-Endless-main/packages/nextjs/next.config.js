// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@scure/bip39', '@noble/hashes', '@cosmjs/crypto'],
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ...(process.env.NODE_ENV !== 'production' ? {
        stream: false,
        crypto: false,
      } : {})
    };
    
    return config;
  },
  // Only enable static export for production builds, not for development
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: process.env.NODE_ENV === "production",
};

module.exports = nextConfig;
