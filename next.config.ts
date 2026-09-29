import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/storage/:path*",
          destination: "https://nqxpyxpqgdzpoasqexcm.supabase.co/storage/:path*",
        },
      ],
      // Agent API lives on the Go server (mcp-gateway/). Must be `fallback`:
      // afterFiles run BEFORE dynamic routes, which would send the kept
      // /api/agent/v1/resumes/[id]/pdf route to the Go server, which proxies
      // PDF back here → infinite loop.
      fallback: [
        {
          source: "/api/agent/:path*",
          destination: "https://agents.gethired.work/api/agent/:path*",
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.gethired.work",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "owntest-nr",
  project: "gethired",

  // 1. Отключаем автоматическую обертку Middleware/Proxy.
  // Твой custom proxy.ts лучше мониторить вручную, чтобы не ломать билд.
  autoInstrumentMiddleware: false,

  // 2. Отключаем автоматическую обертку серверных функций старого роутера.
  // Это уберет ошибку "Cannot find module for page: /_document"
  autoInstrumentServerFunctions: false,

  reactComponentAnnotation: {
    enabled: false,
  },

  // 3. Остальные полезные настройки
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  disableLogger: true,

  tunnelRoute: "/monitoring",

  // Настройки webpack (оставляем твои)
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
