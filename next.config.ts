import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/jogar/cidade-em-disputa", headers: [{ key: "Content-Security-Policy", value: "frame-src https://jogo.alexandrevrabandonada.online https://vr-cidade-em-disputa-web.vercel.app; frame-ancestors 'self'" }] },
      { source: "/unity/fuga/v1/Build/WebGL.wasm.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/wasm" }] },
      { source: "/unity/fuga/v1/Build/WebGL.framework.js.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/javascript" }] },
      { source: "/unity/fuga/v1/Build/WebGL.data.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/octet-stream" }] },
      { source: "/unity/fuga/v2/Build/WebGL.wasm.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/wasm" }] },
      { source: "/unity/fuga/v2/Build/WebGL.framework.js.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/javascript" }] },
      { source: "/unity/fuga/v2/Build/WebGL.data.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/octet-stream" }] },
      { source: "/unity/fuga/v3/Build/WebGL.wasm.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/wasm" }] },
      { source: "/unity/fuga/v3/Build/WebGL.framework.js.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/javascript" }] },
      { source: "/unity/fuga/v3/Build/WebGL.data.gz", headers: [{ key: "Content-Encoding", value: "gzip" }, { key: "Content-Type", value: "application/octet-stream" }] },
    ];
  },
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    qualities: [70, 75],
  },
};

export default nextConfig;
