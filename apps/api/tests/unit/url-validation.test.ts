import { describe, expect, it } from "vitest";
import { AppError } from "../../src/lib/errors.js";
import { normalizeHttpUrl } from "../../src/services/url-validation.js";

describe("normalizeHttpUrl", () => {
  it("accepts absolute HTTP URLs", () => {
    expect(normalizeHttpUrl("http://example.com/path")).toBe(
      "http://example.com/path",
    );
  });

  it("accepts absolute HTTPS URLs", () => {
    expect(normalizeHttpUrl("https://example.com/a/long/path")).toBe(
      "https://example.com/a/long/path",
    );
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeHttpUrl("  https://example.com/docs  ")).toBe(
      "https://example.com/docs",
    );
  });

  it("rejects malformed URLs", () => {
    expect(() => normalizeHttpUrl("not a url")).toThrow(AppError);
    expect(() => normalizeHttpUrl("not a url")).toThrow(
      "Enter a valid HTTP or HTTPS URL.",
    );
  });

  it("rejects unsupported protocols", () => {
    expect(() => normalizeHttpUrl("javascript:alert(1)")).toThrow(
      "Only HTTP and HTTPS URLs are supported.",
    );
    expect(() => normalizeHttpUrl("ftp://example.com/file")).toThrow(
      "Only HTTP and HTTPS URLs are supported.",
    );
  });

  it("rejects URLs without a hostname", () => {
    expect(() => normalizeHttpUrl("https://")).toThrow(AppError);
  });
});
