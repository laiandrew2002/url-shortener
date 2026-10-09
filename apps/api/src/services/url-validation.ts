import { z } from "zod";
import { AppError } from "../lib/errors.js";

export const createUrlBodySchema = z.object({
  url: z
    .string({ required_error: "URL is required." })
    .trim()
    .min(1, "URL is required."),
});

export function normalizeHttpUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AppError(400, "Enter a valid HTTP or HTTPS URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError(400, "Only HTTP and HTTPS URLs are supported.");
  }

  if (!parsed.hostname) {
    throw new AppError(400, "URL must include a valid hostname.");
  }

  return trimmed;
}
