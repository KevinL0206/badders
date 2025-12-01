import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/isomorphic-ws",
    "@libsql/core",
    "@prisma/adapter-libsql",
  ],
  turbopack: {
    resolveAlias: {
      "./node_modules/@libsql/isomorphic-ws/README.md": "",
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
