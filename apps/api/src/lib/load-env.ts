import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const candidates = [
  resolve(import.meta.dirname, "../../.env"),
  resolve(import.meta.dirname, "../../../.env"),
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
];

const envFiles = [...new Set(candidates.filter((filePath) => existsSync(filePath)))];

if (envFiles.length > 0) {
  config({ path: envFiles, quiet: true });
}
