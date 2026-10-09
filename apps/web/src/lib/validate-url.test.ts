import { describe, expect, it } from "vitest";
import { validateUrlInput } from "./validate-url";

describe("validateUrlInput", () => {
  it("accepts HTTP and HTTPS URLs", () => {
    expect(validateUrlInput("https://example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(validateUrlInput("  http://example.com  ")).toBe("http://example.com");
  });

  it("rejects an empty value", () => {
    expect(() => validateUrlInput("   ")).toThrow("Enter a URL to shorten.");
  });

  it("rejects unsupported protocols", () => {
    expect(() => validateUrlInput("javascript:alert(1)")).toThrow(
      "Only HTTP and HTTPS URLs are supported.",
    );
  });
});
