"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Home, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingTypeModal } from "@/components/common/ListingTypeModal";
import { ListingTable, ListingCard } from "@/components/owner";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useSavedHomes, useArchiveListing, useMyListings } from "@/hooks/listings";
import { useRouter } from "@/i18n/routing";
import type { MyListingItem } from "@/types/listings";

type OverviewFilter = "all" | "forRent" | "archived" | "sold";
type MyListingsFilter = "all" | "forRent" | "forSale" | "drafted";
type MainTab = "overview" | "savedHomes" | "myListings" | "messages" | "settings";
type FavoritesSubTab = "favorites" | "hiddenHomes";

const overviewTabMap: Record<OverviewFilter, "all" | "for-rent" | "archived" | "sold"> = {
  all: "all",
  forRent: "for-rent",
  archived: "archived",
  sold: "sold",
};

const myListingsTabMap: Record<MyListingsFilter, "all" | "for-rent" | "for-sale" | "draft" | "archived" | "sold"> = {
  all: "all",
  forRent: "for-rent",
  forSale: "for-sale",
  drafted: "draft",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [overviewFilter, setOverviewFilter] = useState<OverviewFilter>("all");
  const [myListingsFilter, setMyListingsFilter] = useState<MyListingsFilter>("all");
  const [favSubTab, setFavSubTab] = useState<FavoritesSubTab>("favorites");

  const { data: savedHomesData, isLoading: savedHomesLoading } = useSavedHomes(
    { locale },
    { enabled: activeTab === "savedHomes" }
  );

  const { data: overviewData, isLoading: overviewLoading } = useMyListings({
    tab: overviewTabMap[overviewFilter],
    locale,
  });

  const myListingsApiTab = myListingsTabMap[myListingsFilter];
  const { data: myListingsData, isLoading: myListingsLoading } = useMyListings({
    tab: myListingsApiTab,
    locale,
  });

  const router = useRouter();
  const archiveMutation = useArchiveListing();

  const handleEditDraft = useCallback(
    (listing: MyListingItem) => {
      router.push(`/listings/create/${listing.id}`);
    },
    [router]
  );

  // Filter drafts out of "For Rent" / "For Sale" sub-tabs (not "All" or "Drafted")
  const shouldFilterDrafts = (tab: string) =>
    tab === "for-rent" || tab === "for-sale";

  const overviewItems =
    shouldFilterDrafts(overviewTabMap[overviewFilter])
      ? (overviewData?.items ?? []).filter((item) => item.status.toLowerCase() !== "draft")
      : (overviewData?.items ?? []);

  const myListingsItems =
    shouldFilterDrafts(myListingsApiTab)
      ? (myListingsData?.items ?? []).filter((item) => item.status.toLowerCase() !== "draft")
      : (myListingsData?.items ?? []);

  // Count drafts so we can subtract from "For Rent" display count
  const overviewDraftCount = overviewData
    ? (overviewData.items ?? []).filter((i) => i.status.toLowerCase() === "draft").length
    : 0;
  const myListingsDraftCount = myListingsData
    ? (myListingsData.items ?? []).filter((i) => i.status.toLowerCase() === "draft").length
    : 0;

  const overviewFilters: { key: OverviewFilter; label: string }[] = [
    { key: "all",      label: `${t("all")}${overviewData ? ` (${overviewData.counts.all})` : ""}` },
    { key: "forRent",  label: `${t("forRent")}${overviewData ? ` (${Math.max(0, overviewData.counts.forRent - overviewDraftCount)})` : ""}` },
    { key: "archived", label: `${t("archived")}${overviewData ? ` (${overviewData.counts.archived})` : ""}` },
    { key: "sold",     label: `${t("sold")}${overviewData ? ` (${overviewData.counts.sold})` : ""}` },
  ];

  const myListingsFilters: { key: MyListingsFilter; label: string }[] = [
    { key: "all",     label: `${t("all")}${myListingsData ? ` (${myListingsData.counts.all})` : ""}` },
    { key: "forRent", label: `${t("forRent")}${myListingsData ? ` (${Math.max(0, myListingsData.counts.forRent - myListingsDraftCount)})` : ""}` },
    { key: "forSale", label: t("forSale") },
    { key: "drafted", label: t("drafted") },
  ];

  const mainTabs: { key: MainTab; label: string }[] = [
    { key: "overview",    label: t("overview") },
    { key: "savedHomes",  label: t("favorites") },
    { key: "myListings",  label: t("myListings") },
    { key: "messages",    label: t("messages") },
    { key: "settings",    label: t("settings") },
  ];

  const skeletonRows = (
    <div className="space-y-2 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );

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
          {mainTabs.map((tab) => (
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

        {activeTab === "overview" && (
          <Button
            onClick={() => setListingModalOpen(true)}
            className="btn-brand-shadow w-full bg-brand text-white hover:bg-brand-dark sm:w-auto cursor-pointer"
          >
            <Plus className="size-4" />
            {t("postListing")}
          </Button>
        )}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          {/* Property Management — Left Column */}
          <div className="min-w-0 flex-1 rounded-xl border border-border bg-card lg:w-[70%]">
            <div className="mb-4 p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {t("propertyManagement")}
              </h2>

              {/* Filter Tabs */}
              <div className="flex justify-center items-center gap-4 sm:gap-2 rounded-[12px] border border-border p-1 bg-[#E8F0F7]">
                {overviewFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setOverviewFilter(f.key)}
                    className={`rounded-[8px] px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      overviewFilter === f.key
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
              {overviewLoading ? skeletonRows : (
                <ListingTable
                  listings={overviewItems}
                  onArchive={(id) => archiveMutation.mutate({ listingId: id, locale })}
                  onEditDraft={handleEditDraft}
                />
              )}
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {overviewLoading ? skeletonRows : overviewItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                  <Home className="size-10 opacity-30" />
                  <p className="text-sm font-medium">No listings to show</p>
                </div>
              ) : (
                overviewItems.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onArchive={(id) => archiveMutation.mutate({ listingId: id, locale })}
                    onEditDraft={handleEditDraft}
                  />
                ))
              )}
            </div>
          </div>

          {/* Messages Panel — Right Column (Desktop Only) */}
          <div className="hidden rounded-xl border border-border bg-card p-6 lg:block lg:w-[30%]">
            <h2 className="text-lg font-bold text-foreground">
              {t("messages")}
            </h2>
          </div>
        </div>
      )}

      {/* ── FAVORITES TAB ── */}
      {activeTab === "savedHomes" && (
        <div className="mt-6">
          {/* Sub-tab filter */}
          <div className="mb-6 inline-flex items-center gap-1 rounded-[12px] border border-border bg-[#E8F0F7] p-1">
            {(
              [
                { key: "favorites",   label: t("favorites") },
                { key: "hiddenHomes", label: t("hiddenHomes") },
              ] as { key: FavoritesSubTab; label: string }[]
            ).map((sub) => (
              <button
                key={sub.key}
                onClick={() => setFavSubTab(sub.key)}
                className={`rounded-[8px] px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  favSubTab === sub.key
                    ? "bg-white text-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Favorites — Property Grid */}
          {favSubTab === "favorites" && (
            <>
              {savedHomesLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : savedHomesData?.items.length === 0 || !savedHomesData ? (
                <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
                  <Heart className="size-10 opacity-30" />
                  <p className="text-sm font-medium">No saved homes yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {savedHomesData.items.map((item) => (
                    <PropertyCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Hidden Homes — placeholder */}
          {favSubTab === "hiddenHomes" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">
                {t("hiddenHomes")}
              </h2>
            </div>
          )}
        </div>
      )}

      {/* ── MY LISTINGS TAB ── */}
      {activeTab === "myListings" && (
        <div className="mt-6 rounded-xl border border-border bg-card">
          {/* Header: filter tabs + action buttons */}
          <div className="mb-4 p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-[12px] border border-border bg-[#E8F0F7] p-1 self-start">
              {myListingsFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setMyListingsFilter(f.key)}
                  className={`rounded-[8px] px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    myListingsFilter === f.key
                      ? "text-brand bg-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setListingModalOpen(true)}
                className="py-1 bg-brand text-white hover:bg-brand-dark cursor-pointer"
              >
                <Plus className="size-4" />
                {t("postListing")}
              </Button>
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand/5 cursor-pointer"
              >
                {t("uploadSheet")}
              </Button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            {myListingsLoading ? skeletonRows : (
              <ListingTable
                listings={myListingsItems}
                onArchive={(id) => archiveMutation.mutate({ listingId: id, locale })}
                onEditDraft={handleEditDraft}
              />
            )}
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {myListingsLoading ? skeletonRows : myListingsItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                <Home className="size-10 opacity-30" />
                <p className="text-sm font-medium">No listings to show</p>
              </div>
            ) : (
              myListingsItems.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onArchive={(id) => archiveMutation.mutate({ listingId: id, locale })}
                  onEditDraft={handleEditDraft}
                />
              ))
            )}
          </div>
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
