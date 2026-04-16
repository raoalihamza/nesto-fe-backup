import { ROUTES } from "@/lib/constants/routes";

/** Paths allowed as post-login redirects (open-redirect safe). */
const ALLOWED_RETURN_PATHS = new Set<string>([
  ROUTES.OWNER.CREATE,
  ROUTES.OWNER.DASHBOARD,
  ROUTES.OWNER.SALE,
  ROUTES.OWNER.SALE_CREATE,
]);

/**
 * Returns a safe internal path, or null if the raw value is missing or not allowlisted.
 */
export function getSafeReturnUrl(raw: string | null | undefined): string | null {
  if (raw == null || raw === "") return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/")) return null;
    if (decoded.includes("//")) return null;
    if (!ALLOWED_RETURN_PATHS.has(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Backend `ApiError.code` values when `POST /auth/login` (and social equivalents) reject
 * a correct credential because the email is not verified (typically 4xx, no tokens in body).
 * Must match the JSON error payload from the API; extend when the backend documents the code.
 */
export const LOGIN_EMAIL_NOT_VERIFIED_CODES: readonly string[] = [
  "EMAIL_NOT_VERIFIED",
  "EMAIL_UNVERIFIED",
  "UNVERIFIED_EMAIL",
];

export function isLoginEmailNotVerifiedError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("code" in err)) return false;
  const code = String((err as { code?: string }).code ?? "");
  return LOGIN_EMAIL_NOT_VERIFIED_CODES.includes(code);
}
