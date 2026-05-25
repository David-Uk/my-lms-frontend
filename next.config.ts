/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Skip image optimization since we serve SVGs and external images
  images: {
    unoptimized: true,
  },
  // Enable compression for smaller payloads
  compress: true,
  // Remove the x-powered-by header
  poweredByHeader: false,
  // Enable React strict mode for development best practices
  reactStrictMode: true,

  // Cache-Control headers for static assets
  async headers() {
    return [
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
