"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";
import { useStore } from "react-redux";
import type { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setPropertyInfo,
  setListingContext,
  setAddressLookupBusy,
  emptyRentDraftAddress,
  type RentDraftAddress,
  type ListingEntryFormData,
} from "@/store/slices/listingFormSlice";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  rentAddressService,
  type RentAddressSuggestion,
  type RentAddressDetailsResponse,
} from "@/lib/api/rentAddress.service";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants/routes";
import { savePendingRentListing } from "@/lib/utils/pendingRentListingStorage";
import { clearAllDraftData } from "@/lib/utils/clearDraft";

const MIN_QUERY_LEN = 2;
const DEBOUNCE_MS = 400;
const PARTIAL_UNIT_REGEX = /^\d*(\.\d?)?$/;
const VALID_UNIT_REGEX = /^\d+(\.\d)?$/;

function detailsToDraftAddress(d: RentAddressDetailsResponse): RentDraftAddress {
  return {
    placeId: d.placeId,
    formattedAddress: d.formattedAddress,
    addressLine1: d.addressLine1,
    addressLine2: d.addressLine2,
    city: d.city,
    stateCode: d.stateCode,
    postalCode: d.postalCode,
    countryCode: d.countryCode,
    latitude: d.latitude,
    longitude: d.longitude,
  };
}

function listingContextFromAddress(
  addr: RentDraftAddress,
  propertyType: string | null
) {
  return {
    propertyType,
    placeId: addr.placeId,
    formattedAddress: addr.formattedAddress,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    stateCode: addr.stateCode,
    postalCode: addr.postalCode,
    countryCode: addr.countryCode ?? "US",
    latitude: addr.latitude,
    longitude: addr.longitude,
  };
}

function buildListingEntryPayload(
  propertyType: string,
  unit: string,
  numberOfUnits: string,
  isSharedLivingSpace: boolean
): ListingEntryFormData {
  const showUnit = propertyType === "condo_apartment_unit";
  const showNum = propertyType === "entire_apartment_community";
  const numParsed = showNum ? Number(numberOfUnits.trim()) : null;
  return {
    propertyType: propertyType || null,
    unitNumber: showUnit ? (unit.trim() || null) : null,
    numberOfUnits:
      showNum && numParsed !== null && !Number.isNaN(numParsed)
        ? numParsed
        : null,
    isSharedLivingSpace,
  };
}

function isValidUnitDraft(value: string): boolean {
  return PARTIAL_UNIT_REGEX.test(value.trim());
}

function isValidUnitForSubmit(value: string): boolean {
  return VALID_UNIT_REGEX.test(value.trim());
}

export type RentAddressFieldsVariant = "modal" | "step";

export interface RentAddressAndListingEntryFieldsProps {
  variant: RentAddressFieldsVariant;
  /** Modal: pass `open`. Step: always `true` when the step is visible. */
  enabled: boolean;
  /** Modal: close dialog when redirecting unauthenticated user to login. */
  onRequestClose?: () => void;
  /** Modal only: run after Redux updates; await navigation before closing dialog. */
  onModalComplete?: () => void | Promise<void>;
}

/**
 * Address search (debounced + abort), place details, property type, unit/number-of-units, shared living.
 * - **modal**: local state until "Get started" dispatches once.
 * - **step**: shown only when `draftId !== null` (after first property-info API); edit flow on Property Info.
 */
export function RentAddressAndListingEntryFields({
  variant,
  enabled,
  onRequestClose,
  onModalComplete,
}: RentAddressAndListingEntryFieldsProps) {
  const t = useTranslations("rentListingModal");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const draftId = useAppSelector((s) => s.listingForm.draftId);

  const showOnStep =
    variant === "modal" ? true : draftId !== null;

  const searchActive =
    variant === "modal"
      ? enabled
      : enabled && showOnStep;

  const [addressQuery, setAddressQuery] = useState("");
  const debouncedQuery = useDebounce(addressQuery, DEBOUNCE_MS);
  const [resolvedAddress, setResolvedAddress] = useState<RentDraftAddress | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<RentAddressSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [modalNavigating, setModalNavigating] = useState(false);

  const [propertyType, setPropertyType] = useState("");
  const [unit, setUnit] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [isSharedLivingSpace, setIsSharedLivingSpace] = useState(false);

  const searchAbortRef = useRef<AbortController | null>(null);
  const prevDraftId = useRef<string | null | undefined>(undefined);
  const prevShowOnStep = useRef(false);

  const propertyTypes = useMemo(
    () =>
      [
        { value: "house" as const, label: t("typeHouse") },
        {
          value: "entire_apartment_community" as const,
          label: t("typeEntireApartmentCommunity"),
        },
        {
          value: "condo_apartment_unit" as const,
          label: t("typeCondoApartmentUnit"),
        },
        { value: "townhome" as const, label: t("typeTownhome") },
      ],
    [t]
  );

  const showUnitField = propertyType === "condo_apartment_unit";
  const showNumberOfUnitsField =
    propertyType === "entire_apartment_community";
  const selectedPropertyTypeLabel =
    propertyTypes.find((type) => type.value === propertyType)?.label ?? "";

  const hasValidPlace = Boolean(resolvedAddress?.placeId);
  const canSubmit = (() => {
    if (!hasValidPlace || !propertyType) return false;
    if (showUnitField && !isValidUnitForSubmit(unit)) return false;
    if (showNumberOfUnitsField) {
      const n = Number(numberOfUnits.trim());
      if (!numberOfUnits.trim() || Number.isNaN(n) || n < 1) return false;
    }
    return true;
  })();

  // Lets StepNav "Next" disable while address-search / address-details run (step 0 or modal).
  useEffect(() => {
    const lookupSurfaceActive =
      (variant === "modal" && enabled) || (variant === "step" && showOnStep);
    if (!lookupSurfaceActive) {
      dispatch(setAddressLookupBusy(false));
      return;
    }
    const busy = searchLoading || detailsLoading;
    dispatch(setAddressLookupBusy(busy));
    return () => {
      dispatch(setAddressLookupBusy(false));
    };
  }, [
    variant,
    enabled,
    showOnStep,
    searchLoading,
    detailsLoading,
    dispatch,
  ]);

  const hydrateFromStore = useCallback(() => {
    const pi = store.getState().listingForm.formData.propertyInfo;
    setAddressQuery(pi.address.formattedAddress ?? "");
    if (pi.address.placeId && pi.address.latitude != null) {
      setResolvedAddress({ ...emptyRentDraftAddress, ...pi.address });
    } else {
      setResolvedAddress(null);
    }
    setPropertyType(pi.listingEntry.propertyType ?? "");
    setUnit(pi.listingEntry.unitNumber ?? "");
    setNumberOfUnits(
      pi.listingEntry.numberOfUnits != null
        ? String(pi.listingEntry.numberOfUnits)
        : ""
    );
    setIsSharedLivingSpace(pi.listingEntry.isSharedLivingSpace ?? false);
  }, [store]);

  // Step: hydrate when draft changes or block becomes visible (e.g. after first save, back from step 2, edit from review).
  useEffect(() => {
    if (variant !== "step") return;
    const draftChanged = prevDraftId.current !== draftId;
    const becameVisible = showOnStep && !prevShowOnStep.current;
    if (showOnStep && (draftChanged || becameVisible)) {
      hydrateFromStore();
    }
    prevDraftId.current = draftId;
    prevShowOnStep.current = showOnStep;
  }, [variant, showOnStep, draftId, hydrateFromStore]);

  // Modal: reset when closed
  useEffect(() => {
    if (variant !== "modal") return;
    if (!enabled) {
      setAddressQuery("");
      setResolvedAddress(null);
      setSuggestions([]);
      setSuggestionsOpen(false);
      setPropertyType("");
      setUnit("");
      setNumberOfUnits("");
      setIsSharedLivingSpace(false);
      setModalNavigating(false);
    }
  }, [variant, enabled]);

  // Address search (debounced + abort; skip duplicate successful query)
  useEffect(() => {
    if (!searchActive) return;
    const q = debouncedQuery.trim();
    if (q.length < MIN_QUERY_LEN) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }
    if (resolvedAddress && q === resolvedAddress.formattedAddress?.trim()) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    searchAbortRef.current?.abort();
    const ac = new AbortController();
    searchAbortRef.current = ac;
    setSearchLoading(true);

    rentAddressService
      .searchAddresses(q, ac.signal)
      .then((res) => {
        const list = res.suggestions ?? [];
        setSuggestions(list);
        setSuggestionsOpen(list.length > 0);
      })
      .catch((err: unknown) => {
        if (
          (typeof DOMException !== "undefined" &&
            err instanceof DOMException &&
            err.name === "AbortError") ||
          (err instanceof Error && err.name === "AbortError")
        ) {
          return;
        }
        setSuggestions([]);
        toast.error(t("searchFailed"));
      })
      .finally(() => {
        if (!ac.signal.aborted) setSearchLoading(false);
      });

    return () => ac.abort();
  }, [debouncedQuery, searchActive, resolvedAddress, t]);

  const pushAddressToRedux = useCallback(
    (addr: RentDraftAddress | null) => {
      if (variant !== "step") return;
      const pi = store.getState().listingForm.formData.propertyInfo;
      const listingEntry = buildListingEntryPayload(
        propertyType,
        unit,
        numberOfUnits,
        isSharedLivingSpace
      );
      if (!addr?.placeId) {
        dispatch(
          setPropertyInfo({
            address: { ...emptyRentDraftAddress },
            listingEntry: { ...pi.listingEntry, ...listingEntry },
          })
        );
        dispatch(
          setListingContext({
            placeId: null,
            formattedAddress: null,
            addressLine1: null,
            addressLine2: null,
            city: null,
            stateCode: null,
            postalCode: null,
            countryCode: "US",
            latitude: null,
            longitude: null,
            propertyType: listingEntry.propertyType,
          })
        );
        return;
      }
      dispatch(
        setPropertyInfo({
          address: addr,
          listingEntry: { ...pi.listingEntry, ...listingEntry },
        })
      );
      dispatch(setListingContext(listingContextFromAddress(addr, listingEntry.propertyType)));
    },
    [variant, store, dispatch, propertyType, unit, numberOfUnits, isSharedLivingSpace]
  );

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setAddressQuery(next);
      if (
        resolvedAddress &&
        next.trim() !== (resolvedAddress.formattedAddress ?? "").trim()
      ) {
        setResolvedAddress(null);
        setSuggestions([]);
        setSuggestionsOpen(false);
        if (variant === "step") {
          pushAddressToRedux(null);
        }
      }
    },
    [resolvedAddress, variant, pushAddressToRedux]
  );

  const pickSuggestion = async (s: RentAddressSuggestion) => {
    setSuggestionsOpen(false);
    setSuggestions([]);
    setDetailsLoading(true);
    try {
      const d = await rentAddressService.getAddressDetails(s.placeId);
      const addr = detailsToDraftAddress(d);
      setResolvedAddress(addr);
      setAddressQuery(d.formattedAddress);
      if (variant === "step") {
        const pi = store.getState().listingForm.formData.propertyInfo;
        const listingEntry = buildListingEntryPayload(
          propertyType,
          unit,
          numberOfUnits,
          isSharedLivingSpace
        );
        dispatch(
          setPropertyInfo({
            address: addr,
            listingEntry: { ...pi.listingEntry, ...listingEntry },
          })
        );
        dispatch(
          setListingContext(listingContextFromAddress(addr, listingEntry.propertyType))
        );
      }
    } catch {
      toast.error(t("addressDetailsFailed"));
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleModalGetStarted = async () => {
    if (!canSubmit || !resolvedAddress?.placeId) return;
    setModalNavigating(true);
    try {
      // Opening rent creation from modal should not inherit previous draft step/session.
      clearAllDraftData();
      const unitTrim = unit.trim();
      const numUnitsParsed = showNumberOfUnitsField
        ? Number(numberOfUnits.trim())
        : null;
      const listingEntry: ListingEntryFormData = {
        propertyType,
        unitNumber: showUnitField ? unitTrim || null : null,
        numberOfUnits:
          showNumberOfUnitsField &&
          numUnitsParsed !== null &&
          !Number.isNaN(numUnitsParsed)
            ? numUnitsParsed
            : null,
        isSharedLivingSpace,
      };

      if (!isAuthenticated) {
        const returnPath = ROUTES.OWNER.CREATE;
        savePendingRentListing({
          address: resolvedAddress,
          listingEntry,
          returnUrl: returnPath,
        });
        const loginQuery = new URLSearchParams({
          returnUrl: returnPath,
        });
        router.push(`${ROUTES.LOGIN}?${loginQuery.toString()}`);
        onRequestClose?.();
        return;
      }

      dispatch(
        setPropertyInfo({
          address: resolvedAddress,
          listingEntry,
        })
      );
      dispatch(
        setListingContext(
          listingContextFromAddress(resolvedAddress, propertyType)
        )
      );
      await onModalComplete?.();
    } finally {
      setModalNavigating(false);
    }
  };

  if (variant === "step" && !showOnStep) {
    return null;
  }

  const fieldsBlock = (
    <div className="space-y-4">
      <div className="relative">
        {showUnitField || showNumberOfUnitsField ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                {t("streetAddress")}
              </label>
              <Input
                placeholder={t("addressPlaceholder")}
                value={addressQuery}
                onChange={handleAddressChange}
                onFocus={() => {
                  if (suggestions.length > 0) setSuggestionsOpen(true);
                }}
                disabled={detailsLoading}
                autoComplete="off"
                className="h-12 rounded-lg text-base"
              />
            </div>
            {showUnitField ? (
              <div className="shrink-0 sm:w-30">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  {t("unit")} <span className="text-brand">*</span>
                </label>
                <Input
                  inputMode="decimal"
                  pattern="^\d+(\.\d)?$"
                  placeholder={t("unitPlaceholder")}
                  value={unit}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    if (!isValidUnitDraft(v)) return;
                    setUnit(v);
                    if (variant === "step") {
                      const pi = store.getState().listingForm.formData.propertyInfo;
                      dispatch(
                        setPropertyInfo({
                          listingEntry: {
                            ...pi.listingEntry,
                            ...buildListingEntryPayload(
                              propertyType,
                              v,
                              numberOfUnits,
                              isSharedLivingSpace
                            ),
                          },
                        })
                      );
                    }
                  }}
                  className="h-12 rounded-lg text-base"
                />
              </div>
            ) : (
              <div className="shrink-0 sm:w-36">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  {t("numberOfUnits")}{" "}
                  <span className="text-brand">*</span>
                </label>
                <Input
                  inputMode="numeric"
                  placeholder={t("numberOfUnitsPlaceholder")}
                  value={numberOfUnits}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNumberOfUnits(v);
                    if (variant === "step") {
                      const pi = store.getState().listingForm.formData.propertyInfo;
                      dispatch(
                        setPropertyInfo({
                          listingEntry: {
                            ...pi.listingEntry,
                            ...buildListingEntryPayload(
                              propertyType,
                              unit,
                              v,
                              isSharedLivingSpace
                            ),
                          },
                        })
                      );
                    }
                  }}
                  className="h-12 rounded-lg text-base"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              {t("streetAddress")}
            </label>
            <Input
              placeholder={t("addressPlaceholder")}
              value={addressQuery}
              onChange={handleAddressChange}
              onFocus={() => {
                if (suggestions.length > 0) setSuggestionsOpen(true);
              }}
              disabled={detailsLoading}
              autoComplete="off"
              className="h-12 rounded-lg text-base"
            />
          </div>
        )}

        {suggestionsOpen && suggestions.length > 0 && (
          <ul
            className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover py-1 text-sm shadow-md ring-1 ring-foreground/10"
            role="listbox"
          >
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-accent cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(s)}
                >
                  <span className="font-medium text-foreground">{s.mainText}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.secondaryText}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {searchLoading && (
          <p className="mt-1 text-xs text-muted-foreground">{t("searching")}</p>
        )}
        {detailsLoading && (
          <p className="mt-1 text-xs text-muted-foreground">{t("loadingAddress")}</p>
        )}
        {!hasValidPlace &&
          addressQuery.trim().length >= MIN_QUERY_LEN &&
          !searchLoading &&
          !detailsLoading &&
          suggestions.length === 0 &&
          debouncedQuery.trim() === addressQuery.trim() && (
            <p className="mt-1 text-xs text-muted-foreground">{t("noSuggestions")}</p>
          )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">
          {t("propertyType")} <span className="text-brand">*</span>
        </label>
        <Select
          value={propertyType}
          onValueChange={(v) => {
            if (v == null) return;
            setPropertyType(v);
            setUnit("");
            setNumberOfUnits("");
            if (variant === "step") {
              const pi = store.getState().listingForm.formData.propertyInfo;
              const next = buildListingEntryPayload(
                v,
                "",
                "",
                isSharedLivingSpace
              );
              dispatch(
                setPropertyInfo({
                  listingEntry: { ...pi.listingEntry, ...next },
                })
              );
              dispatch(setListingContext({ propertyType: next.propertyType }));
            }
          }}
        >
          <SelectTrigger className="h-12! w-full rounded-lg text-base">
            <SelectValue placeholder={t("propertyTypePlaceholder")}>
              {selectedPropertyTypeLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-3">
        <span className="text-sm font-medium text-foreground">
          {t("sharedLivingSpace")}
        </span>
        <Switch
          checked={isSharedLivingSpace}
          onCheckedChange={(checked) => {
            setIsSharedLivingSpace(checked);
            if (variant === "step") {
              const pi = store.getState().listingForm.formData.propertyInfo;
              dispatch(
                setPropertyInfo({
                  listingEntry: {
                    ...pi.listingEntry,
                    ...buildListingEntryPayload(
                      propertyType,
                      unit,
                      numberOfUnits,
                      checked
                    ),
                  },
                })
              );
            }
          }}
        />
      </div>

      {variant === "modal" && (
        <Button
          onClick={() => void handleModalGetStarted()}
          disabled={
            !canSubmit ||
            detailsLoading ||
            searchLoading ||
            modalNavigating
          }
          className="btn-brand-shadow mt-2 h-12 w-full rounded-lg text-base bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {modalNavigating ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t("getStartedLoading")}
            </span>
          ) : (
            t("getStarted")
          )}
        </Button>
      )}
    </div>
  );

  return fieldsBlock;
}
