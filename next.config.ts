import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark @resvg/resvg-js as an external module to exclude it from bundling
      config.externals = [
        ...(config.externals || []), // Preserve existing externals
        { "@resvg/resvg-js": "commonjs @resvg/resvg-js" },
      ];
    }
    return config;
  },
};

export default nextConfig;