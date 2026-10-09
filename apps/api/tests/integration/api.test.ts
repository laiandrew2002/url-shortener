import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

const longUrl = "https://example.com/a/very/long/path/that/needs/shortening";

describe("API integration", () => {
  const app = createApp();

  beforeEach(async () => {
    await prisma.url.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and persists a short URL", async () => {
    const response = await request(app)
      .post("/api/urls")
      .send({ url: longUrl })
      .expect(201);

    expect(response.body).toEqual({
      code: expect.stringMatching(/^[A-Za-z0-9]{7}$/),
      shortUrl: `http://localhost:4000/${response.body.code}`,
      originalUrl: longUrl,
    });

    const stored = await prisma.url.findUnique({
      where: { shortCode: response.body.code },
    });
    expect(stored?.originalUrl).toBe(longUrl);
  });

  it("returns 400 for an invalid URL", async () => {
    const response = await request(app)
      .post("/api/urls")
      .send({ url: "javascript:alert(1)" })
      .expect(400);

    expect(response.body).toEqual({
      error: "Only HTTP and HTTPS URLs are supported.",
    });
  });

  it("returns 400 when the short URL would not be shorter", async () => {
    const response = await request(app)
      .post("/api/urls")
      .send({ url: "https://ex.co" })
      .expect(400);

    expect(response.body).toEqual({
      error: "The shortened URL would not be shorter than the original URL.",
    });
  });

  it("returns 404 for an unknown short code", async () => {
    const response = await request(app).get("/missing").expect(404);

    expect(response.body).toEqual({ error: "Short URL not found." });
  });

  it("redirects to the original URL", async () => {
    const created = await request(app)
      .post("/api/urls")
      .send({ url: longUrl })
      .expect(201);

    const response = await request(app)
      .get(`/${created.body.code}`)
      .redirects(0)
      .expect(302);

    expect(response.headers.location).toBe(longUrl);
  });

  it("does not overwrite an existing mapping", async () => {
    await prisma.url.create({
      data: {
        shortCode: "taken01",
        originalUrl: "https://example.com/original",
      },
    });

    const created = await request(app)
      .post("/api/urls")
      .send({ url: longUrl })
      .expect(201);

    expect(created.body.code).not.toBe("taken01");

    const original = await prisma.url.findUnique({
      where: { shortCode: "taken01" },
    });
    expect(original?.originalUrl).toBe("https://example.com/original");
  });

  it("enforces unique short codes in the database", async () => {
    await prisma.url.create({
      data: {
        shortCode: "unique1",
        originalUrl: "https://example.com/first",
      },
    });

    await expect(
      prisma.url.create({
        data: {
          shortCode: "unique1",
          originalUrl: "https://example.com/second",
        },
      }),
    ).rejects.toMatchObject({ code: "P2002" });

    const stored = await prisma.url.findUnique({
      where: { shortCode: "unique1" },
    });
    expect(stored?.originalUrl).toBe("https://example.com/first");
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    process.env.RATE_LIMIT_MAX = "1";
    const limitedApp = createApp();
    const payload = { url: `${longUrl}/rate-limit` };

    await request(limitedApp).post("/api/urls").send(payload).expect(201);
    const response = await request(limitedApp)
      .post("/api/urls")
      .send(payload)
      .expect(429);

    expect(response.body).toEqual({
      error: "Too many requests. Please try again later.",
    });

    process.env.RATE_LIMIT_MAX = "0";
  });
});
