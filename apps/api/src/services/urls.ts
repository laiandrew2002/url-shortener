import { getBaseUrl } from "../lib/config.js";
import { AppError, isUniqueConstraintError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { generateShortCode, SHORT_CODE_LENGTH } from "./short-code.js";
import { normalizeHttpUrl } from "./url-validation.js";

export const MAX_SHORT_CODE_ATTEMPTS = 5;

export type ShortenedUrl = {
  code: string;
  shortUrl: string;
  originalUrl: string;
};

export function buildShortUrl(code: string, baseUrl = getBaseUrl()): string {
  return `${baseUrl}/${code}`;
}

export function assertShortUrlIsShorter(originalUrl: string, shortUrl: string) {
  if (shortUrl.length >= originalUrl.length) {
    throw new AppError(
      400,
      "The shortened URL would not be shorter than the original URL.",
    );
  }
}

export async function shortenUrl(rawUrl: string): Promise<ShortenedUrl> {
  const originalUrl = normalizeHttpUrl(rawUrl);
  const previewShortUrl = buildShortUrl("x".repeat(SHORT_CODE_LENGTH));
  assertShortUrlIsShorter(originalUrl, previewShortUrl);

  for (let attempt = 1; attempt <= MAX_SHORT_CODE_ATTEMPTS; attempt += 1) {
    const code = generateShortCode();
    const shortUrl = buildShortUrl(code);

    try {
      await prisma.url.create({
        data: {
          shortCode: code,
          originalUrl,
        },
      });

      return { code, shortUrl, originalUrl };
    } catch (error) {
      if (isUniqueConstraintError(error) && attempt < MAX_SHORT_CODE_ATTEMPTS) {
        continue;
      }

      if (isUniqueConstraintError(error)) {
        throw new AppError(
          500,
          "Unable to generate a unique short URL. Please try again.",
        );
      }

      throw error;
    }
  }

  throw new AppError(
    500,
    "Unable to generate a unique short URL. Please try again.",
  );
}

export async function findUrlByShortCode(code: string) {
  return prisma.url.findUnique({
    where: { shortCode: code },
  });
}
