export function getBaseUrl(): string {
  const value = process.env["BASE_URL"]?.trim();

  if (!value) {
    throw new Error("BASE_URL is not set");
  }

  return value.replace(/\/$/, "");
}

export function getRateLimitMax(): number {
  const parsed = Number(process.env.RATE_LIMIT_MAX ?? 30);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 30;
  }

  return parsed;
}
