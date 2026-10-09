export type ShortenedUrl = {
  code: string;
  shortUrl: string;
  originalUrl: string;
};

function getApiBaseUrl(): string {
  const value = process.env["NEXT_PUBLIC_API_URL"]?.trim() || "http://localhost:4000";
  return value.replace(/\/$/, "");
}

export async function createShortUrl(url: string): Promise<ShortenedUrl> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}/api/urls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error("Unable to reach the shortening service. Please try again.");
  }

  const payload: unknown = await response.json().catch(() => null);
  const message =
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
      ? payload.error
      : "Unable to shorten that URL. Please try again.";

  if (!response.ok) {
    throw new Error(message);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("code" in payload) ||
    !("shortUrl" in payload) ||
    !("originalUrl" in payload)
  ) {
    throw new Error("Unable to shorten that URL. Please try again.");
  }

  const result = payload as ShortenedUrl;

  if (
    typeof result.code !== "string" ||
    typeof result.shortUrl !== "string" ||
    typeof result.originalUrl !== "string"
  ) {
    throw new Error("Unable to shorten that URL. Please try again.");
  }

  return result;
}
