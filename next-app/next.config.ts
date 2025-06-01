import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/projects', // Internally serves the /projects page for the / route
      },
    ];
  },
};

export default nextConfig;
