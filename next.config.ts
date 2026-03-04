import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**', // This allows all paths under the hostname
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**', // Allows all images from this host
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**'
      }
    ],
    
  },
};

export default nextConfig;
