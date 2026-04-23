/** Allow digits only (non-negative integers as string). */
export function sanitizeIntegerDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Allow digits and at most one decimal point (for HOA, area fields, baths, lot size, price typing).
 * Strips all other characters including letters, minus, commas, spaces.
 */
export function sanitizeDecimalChars(raw: string): string {
  let out = "";
  let dotSeen = false;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      out += ch;
      continue;
    }
    if (ch === "." && !dotSeen) {
      out += ch;
      dotSeen = true;
    }
  }
  return out;
}
