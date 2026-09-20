import crypto from "node:crypto";

// No 0/1/i/l/o — visually ambiguous characters, easy to mistype when a slug
// gets read aloud or copied by hand.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const SLUG_LENGTH = 8;

/**
 * ~32^8 (≈1.1 trillion) combinations — collision odds are negligible at this
 * app's scale, but callers should still retry on a unique-constraint
 * violation rather than assume this is guaranteed unique.
 */
export function generateSlug(): string {
  const bytes = crypto.randomBytes(SLUG_LENGTH);
  let slug = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return slug;
}
