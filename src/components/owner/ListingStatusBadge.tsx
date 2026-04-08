import { cn } from "@/lib/utils";

const toneStyles: Record<string, string> = {
  success: "bg-[var(--status-active)]/10 text-[var(--status-active)]",
  warning: "bg-[var(--status-pending)]/10 text-[var(--status-pending)]",
  info:    "bg-[var(--status-rented)]/10 text-[var(--status-rented)]",
  neutral: "bg-[var(--status-archived)]/10 text-[var(--status-archived)]",
  accent:  "bg-[var(--status-sold)]/10 text-[var(--status-sold)]",
};
const fallback = "bg-muted text-muted-foreground";

interface ListingStatusBadgeProps {
  statusLabel: string;
  statusTone: string;
  className?: string;
}

export function ListingStatusBadge({ statusLabel, statusTone, className }: ListingStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        toneStyles[statusTone] ?? fallback,
        className
      )}
    >
      {statusLabel}
    </span>
  );
}
