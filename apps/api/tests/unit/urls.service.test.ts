import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/lib/errors.js";
import { MAX_SHORT_CODE_ATTEMPTS } from "../../src/services/urls.js";

const { prisma, generateShortCode } = vi.hoisted(() => ({
  prisma: {
    url: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
  generateShortCode: vi.fn(),
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma,
}));

vi.mock("../../src/services/short-code.js", async () => {
  const actual = await vi.importActual<
    typeof import("../../src/services/short-code.js")
  >("../../src/services/short-code.js");

  return {
    ...actual,
    generateShortCode,
  };
});

const { shortenUrl, assertShortUrlIsShorter, buildShortUrl } = await import(
  "../../src/services/urls.js"
);

describe("url shortening service", () => {
  beforeEach(() => {
    prisma.url.create.mockReset();
    prisma.url.findUnique.mockReset();
    generateShortCode.mockReset();
    generateShortCode.mockReturnValue("aB7kP2x");
  });

  it("creates a short URL for a valid destination", async () => {
    prisma.url.create.mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      shortCode: "aB7kP2x",
      originalUrl: "https://example.com/a/long/path",
      createdAt: new Date(),
    });

    const result = await shortenUrl("https://example.com/a/long/path");

    expect(result).toEqual({
      code: "aB7kP2x",
      shortUrl: "http://localhost:4000/aB7kP2x",
      originalUrl: "https://example.com/a/long/path",
    });
    expect(prisma.url.create).toHaveBeenCalledWith({
      data: {
        shortCode: "aB7kP2x",
        originalUrl: "https://example.com/a/long/path",
      },
    });
  });

  it("rejects destinations that would not become shorter", () => {
    expect(() =>
      assertShortUrlIsShorter(
        "https://ex.com",
        "http://localhost:4000/aB7kP2x",
      ),
    ).toThrow("The shortened URL would not be shorter than the original URL.");
  });

  it("rejects shortening when the generated URL is not shorter", async () => {
    await expect(shortenUrl("https://ex.co")).rejects.toThrow(
      "The shortened URL would not be shorter than the original URL.",
    );
    expect(prisma.url.create).not.toHaveBeenCalled();
  });

  it("retries when a generated code already exists", async () => {
    prisma.url.create
      .mockRejectedValueOnce({ code: "P2002" })
      .mockRejectedValueOnce({ code: "P2002" })
      .mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
        shortCode: "zzzzzzz",
        originalUrl: "https://example.com/a/long/path",
        createdAt: new Date(),
      });
    generateShortCode
      .mockReturnValueOnce("aaaaaaa")
      .mockReturnValueOnce("bbbbbbb")
      .mockReturnValueOnce("zzzzzzz");

    const result = await shortenUrl("https://example.com/a/long/path");

    expect(result.code).toBe("zzzzzzz");
    expect(prisma.url.create).toHaveBeenCalledTimes(3);
  });

  it("does not overwrite an existing mapping after too many collisions", async () => {
    prisma.url.create.mockRejectedValue({ code: "P2002" });
    generateShortCode.mockReturnValue("taken01");

    await expect(shortenUrl("https://example.com/a/long/path")).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(shortenUrl("https://example.com/a/long/path")).rejects.toThrow(
      "Unable to generate a unique short URL. Please try again.",
    );
    expect(prisma.url.create).toHaveBeenCalledTimes(MAX_SHORT_CODE_ATTEMPTS * 2);
    expect(prisma.url.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.anything() }),
    );
  });

  it("builds short URLs from the configured base URL", () => {
    expect(buildShortUrl("aB7kP2x")).toBe("http://localhost:4000/aB7kP2x");
  });
});
