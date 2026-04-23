/** Max digits in the integer part of the amount (before the decimal). */
export const RENT_MONEY_MAX_INTEGER_DIGITS = 10;

/** Inclusive min when a value is entered (must be &gt; 0). */
export const RENT_MONEY_MIN_AMOUNT = 0.01;

/** Inclusive max: 9,999,999,999.99 */
export const RENT_MONEY_MAX_AMOUNT = 9_999_999_999.99;

const MIN_CENTS = 1;
const MAX_CENTS = 999_999_999_999;

export type OptionalMoneyFieldErrorCode =
  | "invalid_format"
  | "too_many_decimals"
  | "not_positive"
  | "out_of_range";

/** Empty is invalid; otherwise same rules as {@link validateOptionalMoneyField}. */
export type RequiredMoneyFieldErrorCode =
  | "required"
  | OptionalMoneyFieldErrorCode;

export type RequiredMoneyFieldResult = {
  isValid: boolean;
  errorCode: RequiredMoneyFieldErrorCode | null;
  numericValue: number | null;
};

export type OptionalMoneyFieldResult = {
  /** True when the field is blank (only spaces/commas). No error on step. */
  isEmpty: boolean;
  isValid: boolean;
  errorCode: OptionalMoneyFieldErrorCode | null;
  /** Populated only when `isValid` is true. */
  numericValue: number | null;
};

function stripCommasAndTrim(raw: string): string {
  return raw.replace(/,/g, "").trim();
}

/**
 * Keeps only digits and a single `.`, max two fractional digits while typing.
 */
export function sanitizeOptionalMoneyInput(raw: string): string {
  let s = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s =
      s.slice(0, firstDot + 1) +
      s.slice(firstDot + 1).replace(/\./g, "");
    const [intPart = "", frac = ""] = s.split(".");
    s = intPart + "." + frac.slice(0, 2);
  }
  return s;
}

/**
 * Adds thousands separators to a sanitized money string (no commas yet).
 */
export function formatSanitizedMoneyForDisplay(sanitized: string): string {
  if (sanitized === "") return "";
  const endsWithDot = sanitized.endsWith(".") && sanitized.split(".").length === 2;
  const core = endsWithDot ? sanitized.slice(0, -1) : sanitized;
  const [intRaw, frac] = core.split(".");
  const intPart = intRaw ?? "";
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (frac !== undefined) {
    return `${withCommas}.${frac}${endsWithDot && frac === "" ? "." : ""}`;
  }
  return endsWithDot ? `${withCommas}.` : withCommas;
}

function parseToCents(intDigits: string, frac: string): number | null {
  if (!/^\d+$/.test(intDigits)) return null;
  if (frac.length > 2) return null;
  if (frac !== "" && !/^\d+$/.test(frac)) return null;
  const fracPadded = (frac + "00").slice(0, 2);
  const intNum = Number(intDigits);
  const fracNum = Number(fracPadded);
  if (!Number.isFinite(intNum) || !Number.isFinite(fracNum)) return null;
  const cents = intNum * 100 + fracNum;
  if (!Number.isFinite(cents)) return null;
  return cents;
}

/**
 * Validates an optional currency field: empty is allowed; if non-empty, must
 * be a positive amount within bounds, ≤2 decimals, ≤10 integer digits.
 */
export function validateOptionalMoneyField(raw: string): OptionalMoneyFieldResult {
  const s = stripCommasAndTrim(raw);
  if (s === "") {
    return {
      isEmpty: true,
      isValid: true,
      errorCode: null,
      numericValue: null,
    };
  }

  if (s === ".") {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "invalid_format",
      numericValue: null,
    };
  }

  if (/[^\d.]/.test(s)) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "invalid_format",
      numericValue: null,
    };
  }

  const dotCount = (s.match(/\./g) ?? []).length;
  if (dotCount > 1) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "invalid_format",
      numericValue: null,
    };
  }

  const [intRaw = "", fracPart = ""] = s.split(".");
  const frac = fracPart ?? "";

  if (frac.length > 2) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "too_many_decimals",
      numericValue: null,
    };
  }

  if (intRaw === "" && frac === "") {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "invalid_format",
      numericValue: null,
    };
  }

  const intDigits = intRaw === "" ? "0" : intRaw;
  const sigInt = intRaw.replace(/^0+/, "") || "0";
  if (sigInt.length > RENT_MONEY_MAX_INTEGER_DIGITS) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "out_of_range",
      numericValue: null,
    };
  }

  const cents = parseToCents(intDigits, frac);
  if (cents === null) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "invalid_format",
      numericValue: null,
    };
  }

  if (cents < MIN_CENTS) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "not_positive",
      numericValue: null,
    };
  }

  if (cents > MAX_CENTS) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "out_of_range",
      numericValue: null,
    };
  }

  const numericValue = Number(cents) / 100;
  if (!Number.isFinite(numericValue)) {
    return {
      isEmpty: false,
      isValid: false,
      errorCode: "out_of_range",
      numericValue: null,
    };
  }

  return {
    isEmpty: false,
    isValid: true,
    errorCode: null,
    numericValue,
  };
}

/**
 * Required currency input: blank (after trim / comma strip) is `required`.
 * Reuses optional-money parsing so integer/decimals bounds match rent fields.
 */
export function validateRequiredMoneyField(raw: string): RequiredMoneyFieldResult {
  const stripped = stripCommasAndTrim(raw);
  if (stripped === "") {
    return { isValid: false, errorCode: "required", numericValue: null };
  }

  const opt = validateOptionalMoneyField(raw);
  if (!opt.isValid) {
    return {
      isValid: false,
      errorCode: (opt.errorCode ?? "invalid_format") as RequiredMoneyFieldErrorCode,
      numericValue: null,
    };
  }

  if (opt.numericValue == null || opt.numericValue <= 0) {
    return { isValid: false, errorCode: "not_positive", numericValue: null };
  }

  return {
    isValid: true,
    errorCode: null,
    numericValue: opt.numericValue,
  };
}

export function formatUsdRangeLabel(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Display string with grouping for a value restored from Redux. */
export function formatReduxMoneyForInput(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(n);
}
