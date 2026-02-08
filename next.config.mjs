/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Force strict path matching
  trailingSlash: false,

  async rewrites() {
    return {
      // 'beforeFiles' checks this BEFORE checking any pages or dynamic routes
      beforeFiles: [
        {
          source: '/__/auth/:path*',
          destination: 'https://mycreator-2025.firebaseapp.com/__/auth/:path*',
        },
      ],
    };
  },
};

export default nextConfig;