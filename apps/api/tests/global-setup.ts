import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { config } from "dotenv";
import { Client } from "pg";

const apiDir = resolve(import.meta.dirname, "..");
config({ path: resolve(apiDir, "../../.env"), quiet: true });

const testDatabaseUrl =
  process.env.DATABASE_URL_TEST ??
  "postgresql://postgres:postgres@localhost:5432/url_shortener_test";

export default async function globalSetup() {
  const url = new URL(testDatabaseUrl);
  const databaseName = url.pathname.replace(/^\//, "");

  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error(`Unsafe test database name: ${databaseName}`);
  }

  const adminUrl = new URL(testDatabaseUrl);
  adminUrl.pathname = "/postgres";

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();

  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  );

  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${databaseName}"`);
  }

  await client.end();

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: apiDir,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });
}
