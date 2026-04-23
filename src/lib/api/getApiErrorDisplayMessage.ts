function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function dedupeJoin(messages: string[], separator: string): string {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const m of messages) {
    if (seen.has(m)) continue;
    seen.add(m);
    unique.push(m);
  }
  return unique.join(separator);
}

/**
 * Prefer backend validation `details` (issues / fieldErrors) so toasts show
 * human messages only. Falls back to top-level `message` when no structured
 * parts exist (e.g. generic API errors).
 */
export function getApiErrorDisplayMessage(error: unknown): string | null {
  if (!isRecord(error)) return null;

  const topMessage =
    typeof error.message === "string" ? error.message.trim() : "";

  const details = error.details;
  if (isRecord(details)) {
    const issues = details.issues;
    if (Array.isArray(issues) && issues.length > 0) {
      const fromIssues: string[] = [];
      for (const item of issues) {
        if (!isRecord(item)) continue;
        const m = item.message;
        if (typeof m === "string" && m.trim()) fromIssues.push(m.trim());
      }
      if (fromIssues.length > 0) {
        return dedupeJoin(fromIssues, "\n");
      }
    }

    const fieldErrors = details.fieldErrors;
    if (isRecord(fieldErrors)) {
      const fromFields: string[] = [];
      for (const val of Object.values(fieldErrors)) {
        if (!Array.isArray(val)) continue;
        for (const s of val) {
          if (typeof s === "string" && s.trim()) fromFields.push(s.trim());
        }
      }
      if (fromFields.length > 0) {
        return dedupeJoin(fromFields, "\n");
      }
    }

    const formErrors = details.formErrors;
    if (Array.isArray(formErrors) && formErrors.length > 0) {
      const fromForm = formErrors.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0
      );
      if (fromForm.length > 0) {
        return dedupeJoin(fromForm.map((s) => s.trim()), "\n");
      }
    }
  }

  return topMessage || null;
}
