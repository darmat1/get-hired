import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "uk", "ru"],
    defaultLocale: "en",
    // we handle detection via middleware / explicit routing
    localeDetection: false,
  },
};

export default nextConfig;
