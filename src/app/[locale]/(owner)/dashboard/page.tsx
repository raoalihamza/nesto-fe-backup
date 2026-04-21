"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Home, Heart, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingTypeModal } from "@/components/common/ListingTypeModal";
import { RentListingModal } from "@/components/common/RentListingModal";
import { ListingTable, ListingCard } from "@/components/owner";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  useSavedHomes,
  useArchiveListing,
  useInfiniteMyListings,
  useDeleteRentDraftListing,
} from "@/hooks/listings";
import { useRouter } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants/routes";
import { useAppSelector } from "@/store";
import { getUserDisplayName } from "@/lib/auth/getUserDisplayName";
import type { MyListingItem } from "@/types/listings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OverviewFilter = "all" | "forRent" | "forSale";
type MyListingsFilter = "all" | "forRent" | "forSale" | "drafted" | "archived" | "sold";
type MainTab = "overview" | "savedHomes" | "myListings" | "messages" | "settings";
type FavoritesSubTab = "favorites" | "hiddenHomes";

const overviewTabMap: Record<OverviewFilter, "overview" | "for-rent" | "for-sale"> = {
  /** Active rent + sale only; excludes draft/archived/rented/sold */
  all: "overview",
  forRent: "for-rent",
  forSale: "for-sale",
};

const myListingsTabMap: Record<
  MyListingsFilter,
  "my-listing" | "for-rent" | "for-sale" | "draft" | "archived" | "sold"
> = {
  /** Full list (all statuses); distinct from Overview `tab=overview` */
  all: "my-listing",
  forRent: "for-rent",
  forSale: "for-sale",
  drafted: "draft",
  archived: "archived",
  sold: "sold",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const user = useAppSelector((s) => s.auth.user);
  const welcomeName = user
    ? getUserDisplayName(user)
    : t("welcomeGuest");
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [overviewFilter, setOverviewFilter] = useState<OverviewFilter>("all");
  const [myListingsFilter, setMyListingsFilter] = useState<MyListingsFilter>("all");
  const [favSubTab, setFavSubTab] = useState<FavoritesSubTab>("favorites");
  const [draftToDelete, setDraftToDelete] = useState<MyListingItem | null>(null);
  const [listingToArchive, setListingToArchive] = useState<MyListingItem | null>(null);

  const { data: savedHomesData, isLoading: savedHomesLoading } = useSavedHomes(
    { locale },
    { enabled: activeTab === "savedHomes" }
  );

  const {
    data: overviewInfinite,
    isLoading: overviewLoading,
    fetchNextPage: fetchNextOverview,
    hasNextPage: hasNextOverview,
    isFetchingNextPage: isFetchingNextOverview,
  } = useInfiniteMyListings({
    tab: overviewTabMap[overviewFilter],
    locale,
  });

  const myListingsApiTab = myListingsTabMap[myListingsFilter];
  const {
    data: myListingsInfinite,
    isLoading: myListingsLoading,
    fetchNextPage: fetchNextMyListings,
    hasNextPage: hasNextMyListings,
    isFetchingNextPage: isFetchingNextMyListings,
  } = useInfiniteMyListings({
    tab: myListingsApiTab,
    locale,
  });

  // Flatten paginated pages into single arrays + extract first-page metadata
  const overviewAllItems = overviewInfinite?.pages.flatMap((p) => p.items) ?? [];

  const myListingsAllItems = myListingsInfinite?.pages.flatMap((p) => p.items) ?? [];

  // Intersection observer for infinite scroll
  const overviewSentinelRef = useRef<HTMLDivElement>(null);
  const myListingsSentinelRef = useRef<HTMLDivElement>(null);
  const myListingsTabsRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);

  useEffect(() => {
    const sentinel = overviewSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextOverview && !isFetchingNextOverview) {
          fetchNextOverview();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextOverview, isFetchingNextOverview, fetchNextOverview]);

  useEffect(() => {
    const sentinel = myListingsSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextMyListings && !isFetchingNextMyListings) {
          fetchNextMyListings();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextMyListings, isFetchingNextMyListings, fetchNextMyListings]);

  useEffect(() => {
    const el = myListingsTabsRef.current;
    if (!el || activeTab !== "myListings") return;

    const updateScrollButtons = () => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      setCanScrollTabsLeft(el.scrollLeft > 4);
      setCanScrollTabsRight(el.scrollLeft < maxScrollLeft - 4);
    };

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [activeTab, myListingsFilter]);

  useEffect(() => {
    const el = myListingsTabsRef.current;
    if (!el || activeTab !== "myListings") return;
    const activeButton = el.querySelector<HTMLButtonElement>(
      `button[data-tab="${myListingsFilter}"]`
    );
    activeButton?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeTab, myListingsFilter]);

  const router = useRouter();
  const archiveMutation = useArchiveListing();
  const deleteDraftMutation = useDeleteRentDraftListing();

  const handleEditDraft = useCallback(
    (listing: MyListingItem) => {
      router.push(`/listings/create/${listing.id}`);
    },
    [router]
  );

  const handleEditListing = useCallback(
    (listing: MyListingItem) => {
      const type = (listing.listingType ?? "").toString().toLowerCase();
      if (type === "sale") {
        router.push(ROUTES.OWNER.SALE_EDIT(listing.id));
        return;
      }
      // Rent drafts resume the per-step save flow; published rent listings open
      // the stepper in edit mode (GET /edit preload + single full PUT).
      const status = (listing.status ?? "").toString().toLowerCase();
      if (status === "draft") {
        router.push(`/listings/create/${listing.id}`);
        return;
      }
      router.push(`/listings/create/${listing.id}?mode=edit`);
    },
    [router]
  );

  const deletingDraftId =
    deleteDraftMutation.isPending && draftToDelete ? draftToDelete.id : null;
  const archivingListingId =
    archiveMutation.isPending && listingToArchive ? listingToArchive.id : null;

  const handleOpenDeleteDraft = useCallback((listing: MyListingItem) => {
    if (listing.status.toLowerCase() !== "draft") return;
    setDraftToDelete(listing);
  }, []);

  const handleDeleteDraftConfirm = useCallback(async () => {
    if (!draftToDelete) return;
    await deleteDraftMutation.mutateAsync({ listingId: draftToDelete.id });
    setDraftToDelete(null);
  }, [deleteDraftMutation, draftToDelete]);

  const handleDeleteDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (deleteDraftMutation.isPending) return;
      if (!nextOpen) setDraftToDelete(null);
    },
    [deleteDraftMutation.isPending]
  );

  const handleOpenArchive = useCallback((listing: MyListingItem) => {
    if (!listing.actionFlags.canArchive || listing.status.toLowerCase() === "draft") return;
    setListingToArchive(listing);
  }, []);

  const handleArchiveConfirm = useCallback(async () => {
    if (!listingToArchive) return;
    await archiveMutation.mutateAsync({ listingId: listingToArchive.id, locale });
    setListingToArchive(null);
  }, [archiveMutation, listingToArchive, locale]);

  const handleArchiveDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (archiveMutation.isPending) return;
      if (!nextOpen) setListingToArchive(null);
    },
    [archiveMutation.isPending]
  );

  const scrollMyListingTabs = useCallback((direction: "left" | "right") => {
    const el = myListingsTabsRef.current;
    if (!el) return;
    const amount = Math.max(140, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }, []);

  // Filter drafts out of "For Rent" / "For Sale" sub-tabs (not "All" or "Drafted")
  const shouldFilterDrafts = (tab: string) =>
    tab === "for-rent" || tab === "for-sale";

  const overviewItems =
    shouldFilterDrafts(overviewTabMap[overviewFilter])
      ? overviewAllItems.filter((item) => item.status.toLowerCase() !== "draft")
      : overviewAllItems;

  const myListingsItems =
    shouldFilterDrafts(myListingsApiTab)
      ? myListingsAllItems.filter((item) => item.status.toLowerCase() !== "draft")
      : myListingsAllItems;

  const overviewFilters: { key: OverviewFilter; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "forRent", label: t("forRent") },
    { key: "forSale", label: t("forSale") },
  ];

  const myListingsFilters: { key: MyListingsFilter; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "forRent", label: t("forRent") },
    { key: "forSale", label: t("forSale") },
    { key: "drafted", label: t("drafted") },
    { key: "archived", label: t("archived") },
    { key: "sold", label: t("sold") },
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
          {t("welcome", { name: welcomeName })} 👋
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
                  onArchive={handleOpenArchive}
                  onEditDraft={handleEditDraft}
                  onEditListing={handleEditListing}
                  onDeleteDraft={handleOpenDeleteDraft}
                  deletingDraftId={deletingDraftId}
                  archivingListingId={archivingListingId}
                />
              )}
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {overviewLoading ? skeletonRows : overviewItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                  <Home className="size-10 opacity-30" />
                  <p className="text-sm font-medium">{t("noListings")}</p>
                </div>
              ) : (
                overviewItems.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onArchive={handleOpenArchive}
                    onEditDraft={handleEditDraft}
                    onEditListing={handleEditListing}
                    onDeleteDraft={handleOpenDeleteDraft}
                    deletingDraftId={deletingDraftId}
                    archivingListingId={archivingListingId}
                  />
                ))
              )}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={overviewSentinelRef} className="h-1" />
            {isFetchingNextOverview && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
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
                  <p className="text-sm font-medium">{t("noSavedHomes")}</p>
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
            <div className="w-full sm:w-auto">
              <div className="relative sm:hidden">
                <div
                  ref={myListingsTabsRef}
                  className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="inline-flex min-w-max items-center gap-1">
                    {myListingsFilters.map((f) => (
                      <button
                        key={f.key}
                        data-tab={f.key}
                        onClick={() => setMyListingsFilter(f.key)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          myListingsFilter === f.key
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between sm:hidden">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => scrollMyListingTabs("left")}
                    disabled={!canScrollTabsLeft}
                    className="pointer-events-auto h-6 w-6 rounded-full bg-background/95 backdrop-blur cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => scrollMyListingTabs("right")}
                    disabled={!canScrollTabsRight}
                    className="pointer-events-auto h-6 w-6 rounded-full bg-background/95 backdrop-blur cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 rounded-[12px] border border-border bg-[#E8F0F7] p-1 self-start">
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
            </div>

            {/* Action buttons */}
            <div className="grid w-full grid-cols-2 gap-2 sm:hidden">
              <Button
                onClick={() => setListingModalOpen(true)}
                className="h-8 w-full py-2 bg-brand text-white hover:bg-brand-dark cursor-pointer"
              >
                <Plus className="size-4" />
                {t("postListing")}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-full border-brand text-brand hover:bg-brand/5 cursor-pointer"
              >
                {t("uploadSheet")}
              </Button>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                onClick={() => setListingModalOpen(true)}
                className="h-10 gap-1.5 px-2.5 bg-brand text-white hover:bg-brand-dark cursor-pointer"
              >
                <Plus className="size-4" />
                {t("postListing")}
              </Button>
              <Button
                variant="outline"
                className="h-10 gap-1.5 px-2.5 border-brand text-brand hover:bg-brand/5 cursor-pointer"
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
                onArchive={handleOpenArchive}
                onEditDraft={handleEditDraft}
                onEditListing={handleEditListing}
                onDeleteDraft={handleOpenDeleteDraft}
                deletingDraftId={deletingDraftId}
                archivingListingId={archivingListingId}
              />
            )}
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {myListingsLoading ? skeletonRows : myListingsItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                <Home className="size-10 opacity-30" />
                <p className="text-sm font-medium">{t("noListings")}</p>
              </div>
            ) : (
              myListingsItems.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onArchive={handleOpenArchive}
                  onEditDraft={handleEditDraft}
                  onEditListing={handleEditListing}
                  onDeleteDraft={handleOpenDeleteDraft}
                  deletingDraftId={deletingDraftId}
                  archivingListingId={archivingListingId}
                />
              ))
            )}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={myListingsSentinelRef} className="h-1" />
          {isFetchingNextMyListings && (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
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
        onRentChosen={() => setRentModalOpen(true)}
      />

      <RentListingModal open={rentModalOpen} onOpenChange={setRentModalOpen} />

      <Dialog
        open={Boolean(draftToDelete)}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <DialogContent showCloseButton={false} className="md:min-w-lg">
          <DialogHeader>
            <DialogTitle>{t("deleteDraftTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteDraftDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDraftToDelete(null)}
              disabled={deleteDraftMutation.isPending}
              className="cursor-pointer"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleDeleteDraftConfirm}
              disabled={deleteDraftMutation.isPending}
              className="bg-brand text-white hover:bg-brand-dark cursor-pointer"
            >
              {deleteDraftMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("deletingDraft")}
                </>
              ) : (
                tCommon("delete")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(listingToArchive)}
        onOpenChange={handleArchiveDialogOpenChange}
      >
        <DialogContent showCloseButton={false} className="md:min-w-lg">
          <DialogHeader>
            <DialogTitle>{t("archiveListingTitle")}</DialogTitle>
            <DialogDescription>
              {t("archiveListingDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setListingToArchive(null)}
              disabled={archiveMutation.isPending}
              className="cursor-pointer"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleArchiveConfirm}
              disabled={archiveMutation.isPending}
              className="bg-brand text-white hover:bg-brand-dark cursor-pointer"
            >
              {archiveMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("archiving")}
                </>
              ) : (
                t("archive")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
