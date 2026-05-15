import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, Next walks up to
  // find the topmost package.json — which on this machine lives in
  // /Users/traversoleary/Documents and belongs to an unrelated project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
