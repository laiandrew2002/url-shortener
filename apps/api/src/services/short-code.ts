import { randomBytes } from "node:crypto";

export const SHORT_CODE_LENGTH = 7;
export const SHORT_CODE_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateShortCode(
  length = SHORT_CODE_LENGTH,
  alphabet = SHORT_CODE_ALPHABET,
): string {
  const bytes = randomBytes(length);
  let code = "";

  for (const byte of bytes) {
    const index = byte % alphabet.length;
    const character = alphabet[index];

    if (character === undefined) {
      throw new Error("Short-code alphabet is empty.");
    }

    code += character;
  }

  return code;
}

export function isValidShortCode(code: string): boolean {
  return new RegExp(`^[${SHORT_CODE_ALPHABET}]{1,16}$`).test(code);
}
