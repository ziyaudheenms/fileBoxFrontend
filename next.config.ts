import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.clerk.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.clerk.dev', pathname: '/**' },
      { protocol: 'https', hostname: 'www.gravatar.com', pathname: '/**' }, // check format below if needed
    ],
  },
};

export default nextConfig;