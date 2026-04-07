"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingTypeModal } from "@/components/common/ListingTypeModal";
import { ListingTable, ListingCard } from "@/components/owner";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  DUMMY_MY_LISTINGS,
  DUMMY_PROPERTY_PREVIEWS,
} from "@/lib/constants/dummyProperties";

type ListingStatus =
  | "active"
  | "pending"
  | "rented"
  | "archived"
  | "sold"
  | "drafted";
type OverviewFilter = "all" | "forRent" | "archived" | "sold";
type MyListingsFilter = "all" | "forRent" | "forSale" | "drafted";
type MainTab = "overview" | "savedHomes" | "myListings" | "messages" | "settings";
type FavoritesSubTab = "favorites" | "hiddenHomes";

const typedListings = DUMMY_MY_LISTINGS as Array<
  Omit<(typeof DUMMY_MY_LISTINGS)[number], "status"> & { status: ListingStatus }
>;

const overviewFilterMap: Record<OverviewFilter, string[] | null> = {
  all: null,
  forRent: ["active", "pending", "rented"],
  archived: ["archived"],
  sold: ["sold"],
};

// Dummy saved/hidden IDs for the Favorites tab
const DUMMY_SAVED_IDS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const DUMMY_HIDDEN_IDS = ["5", "6"];

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [overviewFilter, setOverviewFilter] = useState<OverviewFilter>("all");
  const [myListingsFilter, setMyListingsFilter] =
    useState<MyListingsFilter>("all");
  const [favSubTab, setFavSubTab] = useState<FavoritesSubTab>("favorites");

  // Overview tab listings
  const overviewListings = useMemo(() => {
    const allowed = overviewFilterMap[overviewFilter];
    if (!allowed) return typedListings;
    return typedListings.filter((l) => allowed.includes(l.status));
  }, [overviewFilter]);

  // My Listings tab listings
  const myListings = useMemo(() => {
    if (myListingsFilter === "all") return typedListings;
    if (myListingsFilter === "drafted")
      return typedListings.filter((l) => l.status === "drafted");
    if (myListingsFilter === "forRent")
      return typedListings.filter(
        (l) => l.listingType === "rent" && l.status !== "drafted"
      );
    if (myListingsFilter === "forSale")
      return typedListings.filter(
        (l) => l.listingType === "sale" && l.status !== "drafted"
      );
    return typedListings;
  }, [myListingsFilter]);

  // Favorites tab properties
  const favoritesProperties = useMemo(
    () => DUMMY_PROPERTY_PREVIEWS.filter((p) => DUMMY_SAVED_IDS.includes(p.id)),
    []
  );
  const hiddenProperties = useMemo(
    () => DUMMY_PROPERTY_PREVIEWS.filter((p) => DUMMY_HIDDEN_IDS.includes(p.id)),
    []
  );

  const overviewFilters: { key: OverviewFilter; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "forRent", label: t("forRent") },
    { key: "archived", label: t("archived") },
    { key: "sold", label: t("sold") },
  ];

  const myListingsFilters: { key: MyListingsFilter; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "forRent", label: t("forRent") },
    { key: "forSale", label: t("forSale") },
    { key: "drafted", label: t("drafted") },
  ];

  const mainTabs: { key: MainTab; label: string }[] = [
    { key: "overview", label: t("overview") },
    { key: "savedHomes", label: t("favorites") },
    { key: "myListings", label: t("myListings") },
    { key: "messages", label: t("messages") },
    { key: "settings", label: t("settings") },
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
              <ListingTable listings={overviewListings} />
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {overviewListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
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
                { key: "favorites", label: t("favorites") },
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {favoritesProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite
                />
              ))}
            </div>
          )}

          {/* Hidden Homes — placeholder, remove `false &&` when implementing */}
          {favSubTab === "hiddenHomes" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">
                {t("hiddenHomes")}
              </h2>
            </div>
          )}

          {false && favSubTab === "hiddenHomes" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hiddenProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
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
            <ListingTable listings={myListings} />
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {myListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
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
