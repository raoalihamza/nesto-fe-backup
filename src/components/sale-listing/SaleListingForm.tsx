"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  useForm,
  Controller,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  resetSaleForm,
  setSaleAddressFromConfirm,
  setSalePhoneVerification,
} from "@/store/slices/saleListingSlice";
import type { SaleFormData, SaleListingPhoto } from "@/lib/saleListing/saleListingFormTypes";
import { createEmptySaleFormData } from "@/lib/saleListing/saleListingFormTypes";
import { saleListingFormSchema } from "@/lib/saleListing/saleListingFormSchema";
import { saleListingMediaService } from "@/lib/api/saleListingMedia.service";
import { saleListingService } from "@/lib/api/saleListing.service";
import {
  buildCreateSaleListingBody,
  buildUpdateSaleListingBody,
} from "@/lib/saleListing/buildSaleListingPayload";
import {
  mapEditResponseToValidatedAddress,
  mapSaleEditResponseToFormData,
} from "@/lib/saleListing/mapSaleEditResponseToForm";
import { Loader2 } from "lucide-react";
import type { ApiError } from "@/types/user";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants/routes";
import { sanitizeDecimalChars } from "@/lib/input/numericSanitize";
import { SectionHeading } from "@/components/sale-listing/SaleListingFormUi";
import {
  SaleListingPhotosBlock,
  SaleListingVirtualTourHomeFactsBlock,
  SaleListingOpenHouseBlock,
  SaleListingAdditionalInfoBlock,
  SaleListingRoomUtilityBlock,
  SaleListingBuildingBlock,
  SaleListingContactFooterBlock,
} from "@/components/sale-listing/SaleListingFormSections";

function firstZodIssueMessage(errors: FieldErrors<SaleFormData>): string | null {
  const walk = (o: unknown): string | null => {
    if (o == null || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (typeof rec.message === "string" && rec.message) return rec.message;
    for (const v of Object.values(rec)) {
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const item of v) {
          const m = walk(item);
          if (m) return m;
        }
      } else {
        const m = walk(v);
        if (m) return m;
      }
    }
    return null;
  };
  return walk(errors);
}

interface SalePhotoUploadPreview {
  id: string;
  name: string;
  previewUrl: string;
}

interface SaleListingFormProps {
  /** When provided, the form loads the listing and submits a PUT update. */
  listingId?: string;
}

// ─── Main component ─────────────────────────────────────────────────
export function SaleListingForm({ listingId }: SaleListingFormProps = {}) {
  const isEditMode = Boolean(listingId);
  const t = useTranslations("saleListing.form");
  const tOpt = useTranslations("saleListing.options");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const address = useAppSelector((s) => s.saleListing.address);
  const validatedAddress = useAppSelector((s) => s.saleListing.validatedAddress);
  const salePhoneVerified = useAppSelector((s) => s.saleListing.salePhoneVerified);
  const verifiedSalePhone = useAppSelector((s) => s.saleListing.verifiedSalePhone);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<SaleFormData>({
    resolver: zodResolver(
      saleListingFormSchema
    ) as Resolver<SaleFormData>,
    defaultValues: createEmptySaleFormData(),
    mode: "onTouched",
  });

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => String(current - i));
  }, []);

  const patch = useCallback(
    (p: Partial<SaleFormData>) => {
      for (const [key, val] of Object.entries(p)) {
        setValue(key as keyof SaleFormData, val as never, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    },
    [setValue]
  );

  const [roomDetailsOpen, setRoomDetailsOpen] = useState(true);
  const [utilityDetailsOpen, setUtilityDetailsOpen] = useState(true);
  const [buildingDetailsOpen, setBuildingDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingListing, setIsLoadingListing] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<SalePhotoUploadPreview[]>(
    []
  );
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    setIsLoadingListing(true);
    setLoadError(null);

    (async () => {
      try {
        const [editResp, mediaResp] = await Promise.all([
          saleListingService.getListingForEdit(listingId),
          saleListingMediaService.getListingMedia(listingId),
        ]);
        if (cancelled) return;

        const validated = mapEditResponseToValidatedAddress(editResp);
        if (!validated) {
          setLoadError(t("editLoadError"));
          return;
        }

        const photos = (mediaResp.photos && mediaResp.photos.length > 0)
          ? mediaResp.photos
          : mediaResp.items ?? [];
        const formValues = mapSaleEditResponseToFormData(editResp, photos);

        dispatch(setSaleAddressFromConfirm({ validated }));
        if (formValues.contactPhone) {
          dispatch(
            setSalePhoneVerification({
              verified: true,
              phoneE164: formValues.contactPhone,
            })
          );
        }
        reset(formValues);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error && error.message
            ? error.message
            : t("editLoadError");
        setLoadError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setIsLoadingListing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listingId, dispatch, reset, t]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const currentPhotos = getValues("photos");
      const uniqueFiles = acceptedFiles.filter((file) => {
        const isDuplicate = currentPhotos.some(
          (p) =>
            p.fileName === file.name && p.fileSizeBytes === file.size
        );
        if (isDuplicate) {
          toast.error(t("duplicatePhoto", { name: file.name }));
        }
        return !isDuplicate;
      });

      if (uniqueFiles.length === 0) return;

      const previews: SalePhotoUploadPreview[] = uniqueFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
      setUploadingFiles((prev) => [...prev, ...previews]);

      try {
        const photosLen = getValues("photos").length;
        const presignBody = {
          files: uniqueFiles.map((file, i) => ({
            listingType: "SALE" as const,
            mediaType: "PHOTO" as const,
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            fileSizeBytes: file.size,
            sortOrder: photosLen + i,
            metadata: { source: "sale-listing-form" },
          })),
        };
        const presignResult = listingId
          ? await saleListingMediaService.presignListingMedia(listingId, presignBody)
          : await saleListingMediaService.presignMedia(presignBody);

        const uploadResults = await Promise.allSettled(
          presignResult.uploads.map(async (upload, i) => {
            const file = uniqueFiles[i];
            const response = await fetch(upload.uploadUrl, {
              method: upload.method,
              body: file,
              headers: upload.headers,
            });
            if (!response.ok) throw new Error(`Upload failed: ${file.name}`);
            return { upload, file, index: i };
          })
        );

        const successfulUploads = uploadResults
          .filter(
            (
              r
            ): r is PromiseFulfilledResult<{
              upload: (typeof presignResult.uploads)[number];
              file: File;
              index: number;
            }> => r.status === "fulfilled"
          )
          .map((r) => r.value);

        const failedCount = uploadResults.length - successfulUploads.length;
        if (failedCount > 0) {
          toast.error(t("photoPartialFailure", { count: failedCount }));
        }

        if (successfulUploads.length > 0) {
          const baseLen = getValues("photos").length;
          // Listing-scoped presign returns `mediaId`; flow-scoped returns `uploadId`.
          // Normalize here so downstream confirm + photo resolution works for both.
          const uploadsWithId = successfulUploads
            .map((u) => ({ ...u, id: u.upload.mediaId ?? u.upload.uploadId ?? "" }))
            .filter((u) => u.id);

          if (uploadsWithId.length !== successfulUploads.length) {
            toast.error(t("photoUploadError"));
          }

          const confirmed = listingId
            ? await saleListingMediaService.confirmListingMedia(listingId, {
                uploads: uploadsWithId.map(({ id, file, index }) => ({
                  mediaId: id,
                  fileSizeBytes: file.size,
                  sortOrder: baseLen + index,
                  metadata: { confirmedBy: "sale-listing-form" },
                })),
              })
            : await saleListingMediaService.confirmMedia({
                uploads: uploadsWithId.map(({ id, file, index }) => ({
                  uploadId: id,
                  fileSizeBytes: file.size,
                  sortOrder: baseLen + index,
                  metadata: { confirmedBy: "sale-listing-form" },
                })),
              });

          const byId = new Map(
            confirmed.photos.map((item) => [item.id, item] as [string, typeof item])
          );
          for (const item of confirmed.items) {
            if (!byId.has(item.id)) {
              byId.set(item.id, item);
            }
          }

          const newPhotos: SaleListingPhoto[] = uploadsWithId
            .map(({ id }) => byId.get(id))
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .map((item) => ({
              id: item.id,
              url: item.url,
              fileName: item.fileName,
              fileSizeBytes: item.fileSizeBytes,
            }));

          setValue("photos", [...getValues("photos"), ...newPhotos], {
            shouldDirty: true,
            shouldValidate: false,
          });
        }
      } catch {
        toast.error(t("photoUploadError"));
      } finally {
        setUploadingFiles((prev) => {
          previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
          return prev.filter((f) => !previews.some((pr) => pr.id === f.id));
        });
      }
    },
    [getValues, setValue, t, listingId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  });

  const removePhoto = async (index: number) => {
    const photos = getValues("photos");
    const photo = photos[index];
    if (!photo || deletingIds.has(photo.id)) return;
    // Backend blocks deleting the last confirmed photo on edit; enforce in UI too.
    if (listingId && photos.length <= 1) {
      toast.error(t("photoLastCannotDelete"));
      return;
    }
    setDeletingIds((prev) => new Set(prev).add(photo.id));
    try {
      if (listingId) {
        await saleListingMediaService.deleteListingMedia(listingId, photo.id);
      } else {
        await saleListingMediaService.deleteMedia(photo.id);
      }
      setValue(
        "photos",
        photos.filter((_, i) => i !== index),
        { shouldDirty: true, shouldValidate: false }
      );
    } catch {
      toast.error(t("photoDeleteError"));
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(photo.id);
        return next;
      });
    }
  };

  const addOpenHouse = () => {
    setValue(
      "openHouseDates",
      [...getValues("openHouseDates"), { date: "", startTime: "", endTime: "" }],
      { shouldDirty: true }
    );
  };

  const updateOpenHouse = (
    index: number,
    field: "date" | "startTime" | "endTime",
    value: string
  ) => {
    const updated = getValues("openHouseDates").map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setValue("openHouseDates", updated, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const removeOpenHouse = (index: number) => {
    setValue(
      "openHouseDates",
      getValues("openHouseDates").filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: false }
    );
  };

  const onValidSubmit = async (data: SaleFormData) => {
    if (!validatedAddress) {
      toast.error(t("submitMissingValidatedAddress"));
      return;
    }
    if (!salePhoneVerified || !verifiedSalePhone) {
      toast.error(t("submitPhoneNotVerified"));
      return;
    }
    const contact = data.contactPhone.trim();
    if (contact !== verifiedSalePhone.trim()) {
      toast.error(t("submitPhoneMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      if (listingId) {
        const body = buildUpdateSaleListingBody(validatedAddress, data);
        await saleListingService.updateListing(listingId, body);
        toast.success(t("editSaveSuccess"));
        dispatch(resetSaleForm());
        router.push(ROUTES.OWNER.DASHBOARD);
      } else {
        const body = buildCreateSaleListingBody(validatedAddress, data);
        await saleListingService.createListing(body);
        dispatch(resetSaleForm());
        reset(createEmptySaleFormData());
        router.push(ROUTES.OWNER.DASHBOARD);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        toast.error((error as ApiError).message || t("submitError"));
      } else {
        toast.error(t("submitError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidSubmit = (fieldErrors: FieldErrors<SaleFormData>) => {
    const msg = firstZodIssueMessage(fieldErrors);
    toast.error(msg || t("submitError"));
  };

  const addressText = [
    address.street,
    address.city,
    address.state,
    address.zip,
  ]
    .filter(Boolean)
    .join(", ");
  const displayAddress =
    validatedAddress?.formattedAddress?.trim() || addressText;

  if (isEditMode && isLoadingListing) {
    return (
      <div className="max-w-4xl px-6 py-8 lg:px-10">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">{t("editLoading")}</span>
        </div>
      </div>
    );
  }

  if (isEditMode && loadError) {
    return (
      <div className="max-w-4xl px-6 py-8 lg:px-10">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl px-6 py-8 lg:px-10">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEditMode ? t("editTitle") : t("title")}
        </h1>
        <p className="mt-1 text-base font-medium text-foreground">{displayAddress}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("addressLockedHint")}</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="mb-8 border-b border-border pb-6">
        <SectionHeading>{t("setYourPrice")}</SectionHeading>
        <div className="relative max-w-xs">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                inputMode="decimal"
                value={
                  field.value === null || field.value === undefined
                    ? ""
                    : String(field.value)
                }
                onChange={(e) => {
                  const sanitized = sanitizeDecimalChars(e.target.value);
                  if (sanitized === "" || sanitized === ".") {
                    field.onChange(null);
                    return;
                  }
                  const n = Number(sanitized);
                  field.onChange(Number.isFinite(n) ? n : null);
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className="h-12 pl-7"
                placeholder="0"
              />
            )}
          />
          {errors.price ? (
            <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <SectionHeading>{t("home3D")}</SectionHeading>
        <p className="text-sm text-muted-foreground">
          {t("home3DDescription")}{" "}
          <button
            type="button"
            className="font-medium text-brand hover:underline"
          >
            {t("tryItFree")}
          </button>
        </p>
        <SaleListingPhotosBlock
          control={control}
          t={t}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          uploadingFiles={uploadingFiles}
          deletingIds={deletingIds}
          removePhoto={removePhoto}
        />
        <SaleListingVirtualTourHomeFactsBlock
          control={control}
          patch={patch}
          t={t}
          tOpt={tOpt}
          yearOptions={yearOptions}
        />
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <SaleListingOpenHouseBlock
          control={control}
          t={t}
          addOpenHouse={addOpenHouse}
          updateOpenHouse={updateOpenHouse}
          removeOpenHouse={removeOpenHouse}
        />
      </div>

      <div className="mb-8 pb-8">
        <SaleListingAdditionalInfoBlock control={control} patch={patch} t={t} />
      </div>

      <SaleListingRoomUtilityBlock
        control={control}
        patch={patch}
        t={t}
        tOpt={tOpt}
        roomDetailsOpen={roomDetailsOpen}
        setRoomDetailsOpen={setRoomDetailsOpen}
        utilityDetailsOpen={utilityDetailsOpen}
        setUtilityDetailsOpen={setUtilityDetailsOpen}
      />

      <SaleListingBuildingBlock
        control={control}
        patch={patch}
        t={t}
        tOpt={tOpt}
        buildingDetailsOpen={buildingDetailsOpen}
        setBuildingDetailsOpen={setBuildingDetailsOpen}
      />

      <SaleListingContactFooterBlock
        control={control}
        patch={patch}
        setValue={setValue}
        t={t}
        handleSubmit={handleSubmit}
        onValidSubmit={onValidSubmit}
        onInvalidSubmit={onInvalidSubmit}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
      />
    </div>
  );
}
