import { defineConfig } from "vitest/config";

const testEnv = {
  NODE_ENV: "test",
  BASE_URL: "http://localhost:4000",
  FRONTEND_URL: "http://localhost:3000",
  RATE_LIMIT_MAX: "0",
};

export default defineConfig({
  test: {
    environment: "node",
    env: testEnv,
    setupFiles: ["./tests/setup.ts"],
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          env: testEnv,
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/unit/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          environment: "node",
          env: testEnv,
          setupFiles: ["./tests/setup.ts"],
          globalSetup: ["./tests/global-setup.ts"],
          include: ["tests/integration/**/*.test.ts"],
          fileParallelism: false,
        },
      },
    ],
  },
});
