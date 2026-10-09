import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(import.meta.dirname, "../../../.env"), quiet: true });

process.env.NODE_ENV = "test";
process.env.BASE_URL = "http://localhost:4000";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ?? "0";
process.env.DATABASE_URL_TEST ??=
  "postgresql://postgres:postgres@localhost:5432/url_shortener_test";
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
