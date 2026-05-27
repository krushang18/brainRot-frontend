import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['192.168.24.68', '192.168.24.136', '192.168.24.75', 'localhost', 'brainrot-frontend.home.arpa'],
};

export default nextConfig;
