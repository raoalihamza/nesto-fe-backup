"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingTypeModal } from "@/components/common/ListingTypeModal";
import { ListingTable, ListingCard } from "@/components/owner";
import { DUMMY_MY_LISTINGS } from "@/lib/constants/dummyProperties";

type ListingStatus = "active" | "pending" | "rented" | "archived" | "sold";
type FilterStatus = "all" | "forRent" | "archived" | "sold";
type MainTab = "overview" | "savedHomes" | "myListings" | "messages" | "settings";

const typedListings = DUMMY_MY_LISTINGS as Array<
  Omit<(typeof DUMMY_MY_LISTINGS)[number], "status"> & { status: ListingStatus }
>;

const filterMap: Record<FilterStatus, string[] | null> = {
  all: null,
  forRent: ["active", "pending", "rented"],
  archived: ["archived"],
  sold: ["sold"],
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const filteredListings = useMemo(() => {
    const allowed = filterMap[activeFilter];
    if (!allowed) return typedListings;
    return typedListings.filter((l) => allowed.includes(l.status));
  }, [activeFilter]);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "forRent", label: t("forRent") },
    { key: "archived", label: t("archived") },
    { key: "sold", label: t("sold") },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("welcome", { name: "Alex" })} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {t("newInquiries", { count: 2, homes: 12 })}
        </p>
      </div>

      {/* Main Tabs Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-1">
          {(
            [
              { key: "overview", label: t("overview") },
              { key: "savedHomes", label: t("savedHomes") },
              { key: "myListings", label: t("myListings") },
              { key: "messages", label: t("messages") },
              { key: "settings", label: t("settings") },
            ] as { key: MainTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[8px] px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <Button
          onClick={() => setListingModalOpen(true)}
          className="btn-brand-shadow w-full bg-brand text-white hover:bg-brand-dark sm:w-auto cursor-pointer"
        >
          <Plus className="size-4" />
          {t("postListing")}
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          {/* Property Management — Left Column */}
          <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-4 sm:p-6 lg:w-[65%]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {t("propertyManagement")}
              </h2>

              {/* Filter Tabs */}
              <div className="flex gap-1 rounded-[12px] border border-border p-1 bg-[#E8F0F7]">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`rounded-[8px] px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      activeFilter === f.key
                        ? "text-brand bg-[#FFFFFF]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block">
              <ListingTable listings={filteredListings} />
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>

          {/* Messages Panel — Right Column (Desktop Only) */}
          <div className="hidden rounded-xl border border-border bg-card p-6 lg:block lg:w-[35%]">
            <h2 className="text-lg font-bold text-foreground">
              {t("messages")}
            </h2>
          </div>
        </div>
      )}

      {activeTab === "savedHomes" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">
            {t("savedHomes")}
          </h2>
        </div>
      )}

      {activeTab === "myListings" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">
            {t("myListings")}
          </h2>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">{t("messages")}</h2>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">{t("settings")}</h2>
        </div>
      )}

      <ListingTypeModal
        open={listingModalOpen}
        onOpenChange={setListingModalOpen}
      />
    </div>
  );
}
