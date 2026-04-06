import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:locale/auth/verify-email",
        destination: "/:locale/verify-email",
      },
      {
        source: "/:locale/auth/reset-password",
        destination: "/:locale/reset-password",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
