import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

const apiDir = import.meta.dirname;

config({ path: resolve(apiDir, ".env") });
config({ path: resolve(apiDir, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/url_shortener",
  },
});
