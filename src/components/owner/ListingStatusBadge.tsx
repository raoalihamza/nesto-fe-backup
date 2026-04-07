import { cn } from "@/lib/utils";

type ListingStatus = "active" | "pending" | "rented" | "archived" | "sold" | "drafted";

const statusStyles: Record<ListingStatus, string> = {
  active: "bg-[var(--status-active)]/10 text-[var(--status-active)]",
  pending: "bg-[var(--status-pending)]/10 text-[var(--status-pending)]",
  rented: "bg-[var(--status-rented)]/10 text-[var(--status-rented)]",
  archived: "bg-[var(--status-archived)]/10 text-[var(--status-archived)]",
  sold: "bg-[var(--status-sold)]/10 text-[var(--status-sold)]",
  drafted: "bg-muted text-muted-foreground",
};

interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function ListingStatusBadge({ status, className }: ListingStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
