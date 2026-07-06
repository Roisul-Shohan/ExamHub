import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lock Turbopack to this project root so the "multiple lockfiles" warning
  // does not turn into build failures on machines with a parent package.json.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
