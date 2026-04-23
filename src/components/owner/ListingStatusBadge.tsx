import { cn } from "@/lib/utils";

/**
 * Status pills use fixed Tailwind palette utilities so they always render
 * (no reliance on `variables.css` or custom `--status-*` CSS vars).
 */
const toneClass = {
  success: "bg-emerald-100 text-emerald-900",
  /** Pending + draft: same amber pill (product treats draft as pending-style). */
  warning: "bg-amber-100 text-amber-900",
  info: "bg-sky-100 text-sky-900",
  neutral: "bg-slate-200 text-slate-800",
  accent: "bg-violet-100 text-violet-900",
} as const;

type ToneKey = keyof typeof toneClass;

const fallbackClass = "bg-slate-100 text-slate-700";

/**
 * Map raw API / UI strings → `toneClass` key.
 * Includes dashboard `tab` values defensively if they appear on row payloads.
 */
const toneAliases: Record<string, ToneKey> = {
  active: "success",
  published: "success",
  live: "success",
  pending: "warning",
  rented: "info",
  archived: "neutral",
  sold: "accent",
  draft: "warning",
  drafted: "warning",
  all: "neutral",
  overview: "neutral",
  my_listing: "neutral",
  for_rent: "info",
  for_sale: "success",
};

function normalizeStatusKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

function resolveToneKey(statusTone: string, statusValue?: string): ToneKey | null {
  const candidates = [
    normalizeStatusKey(statusTone ?? ""),
    normalizeStatusKey(statusValue ?? ""),
  ];
  for (const key of candidates) {
    if (!key) continue;
    if (key in toneClass) return key as ToneKey;
    const mapped = toneAliases[key];
    if (mapped) return mapped;
  }
  return null;
}

interface ListingStatusBadgeProps {
  statusLabel: string;
  statusTone: string;
  statusValue?: string;
  className?: string;
}

export function ListingStatusBadge({
  statusLabel,
  statusTone,
  statusValue,
  className,
}: ListingStatusBadgeProps) {
  const toneKey = resolveToneKey(statusTone, statusValue);

  return (
    <span
      className={cn(
        "inline-flex min-h-6 min-w-13 items-center justify-center rounded-full px-2.5 py-0.5 text-center text-xs font-semibold capitalize",
        toneKey ? toneClass[toneKey] : fallbackClass,
        className
      )}
    >
      {statusLabel}
    </span>
  );
}
