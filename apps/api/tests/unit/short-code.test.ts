import { describe, expect, it } from "vitest";
import {
  generateShortCode,
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
} from "../../src/services/short-code.js";

describe("generateShortCode", () => {
  it("generates codes of the configured length", () => {
    for (let index = 0; index < 50; index += 1) {
      expect(generateShortCode()).toHaveLength(SHORT_CODE_LENGTH);
    }
  });

  it("only uses the URL-safe alphabet", () => {
    const allowed = new Set(SHORT_CODE_ALPHABET);

    for (let index = 0; index < 50; index += 1) {
      for (const character of generateShortCode()) {
        expect(allowed.has(character)).toBe(true);
      }
    }
  });
});
