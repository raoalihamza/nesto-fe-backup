/**
 * Display name for greetings: any non-empty first/last name (joined with a
 * space), otherwise the email local-part (substring before `@`).
 */
export function getUserDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}): string {
  const first = (user.firstName ?? "").trim();
  const last = (user.lastName ?? "").trim();
  const fromNames = [first, last].filter(Boolean).join(" ");
  if (fromNames) {
    return fromNames;
  }

  const email = (user.email ?? "").trim();
  const at = email.indexOf("@");
  const local = at > 0 ? email.slice(0, at) : email;
  return local || "User";
}
