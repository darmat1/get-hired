import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**/*.ts", "src/app/api/**/*.ts"],
      exclude: ["src/generated/**", "src/lib/prisma.ts"],
    },
  },
});
