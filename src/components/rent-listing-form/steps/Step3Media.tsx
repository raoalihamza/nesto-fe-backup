"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setMedia,
  restoreFromDraft,
  normalizeTours3d,
  beginMediaUpload,
  endMediaUpload,
} from "@/store/slices/listingFormSlice";
import type { DraftMediaItem, RentDraftResponse } from "@/store/slices/listingFormSlice";
import { rentDraftService } from "@/lib/api/rentDraft.service";
import { rentListingEditService } from "@/lib/api/rentListingEdit.service";
import { toast } from "sonner";
import { CloudUpload, X, Loader2, DoorOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { SUPPORTED_3D_TOUR_PROVIDERS } from "@/constants/supported3dTourProviders";
import { cn } from "@/lib/utils";

interface UploadingFile {
  id: string;
  name: string;
  previewUrl: string;
}

function hasTopLevelMedia(
  value: unknown
): value is {
  items?: DraftMediaItem[];
  photos?: DraftMediaItem[];
  tours3d?: unknown;
} {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return "items" in o || "photos" in o || "tours3d" in o;
}

function hasFullDraftShape(
  value: unknown
): value is RentDraftResponse {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === "string" && "media" in o;
}

function chunkIntoColumns<T>(items: readonly T[], columnCount: number): T[][] {
  if (items.length === 0) return Array.from({ length: columnCount }, () => []);
  const perCol = Math.ceil(items.length / columnCount);
  return Array.from({ length: columnCount }, (_, i) =>
    items.slice(i * perCol, (i + 1) * perCol)
  );
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function Step3Media() {
  const t = useTranslations("listing.media");
  const dispatch = useAppDispatch();
  const media = useAppSelector((s) => s.listingForm.formData.media);
  const draftId = useAppSelector((s) => s.listingForm.draftId);
  const mode = useAppSelector((s) => s.listingForm.mode);
  const isEditMode = mode === "edit";

  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourNameInput, setTourNameInput] = useState("");
  const [tourUrlInput, setTourUrlInput] = useState("");
  const [tourFieldErrors, setTourFieldErrors] = useState<{
    name?: boolean;
    url?: boolean;
  }>({});
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const providerColumns = useMemo(
    () => chunkIntoColumns(SUPPORTED_3D_TOUR_PROVIDERS, 4),
    []
  );

  useEffect(() => {
    if (!tourModalOpen) return;
    const existing = media.tours3d[0];
    setTourNameInput(existing?.tourName ?? "");
    setTourUrlInput(existing?.tourUrl ?? "");
    setTourFieldErrors({});
  }, [tourModalOpen, media.tours3d]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!draftId) {
        toast.error("Please save Property Info first before uploading photos.");
        return;
      }

      const uniqueFiles = acceptedFiles.filter((file) => {
        const isDuplicate = media.photos.some(
          (p) => p.fileName === file.name && p.fileSizeBytes === file.size
        );
        if (isDuplicate) {
          toast.error(t("duplicatePhoto", { name: file.name }));
        }
        return !isDuplicate;
      });

      if (uniqueFiles.length === 0) return;

      const previews: UploadingFile[] = uniqueFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
      setUploadingFiles((prev) => [...prev, ...previews]);
      dispatch(beginMediaUpload());

      try {
        const presignBody = {
          files: uniqueFiles.map((file, i) => ({
            mediaType: "PHOTO" as const,
            fileName: file.name,
            contentType: file.type,
            fileSizeBytes: file.size,
            sortOrder: media.photos.length + i,
          })),
        };
        const presignResult = isEditMode
          ? await rentListingEditService.presignMedia(draftId, presignBody)
          : await rentDraftService.presignMedia(draftId, presignBody);

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
          toast.error(`Failed to upload ${failedCount} photo(s).`);
        }

        if (successfulUploads.length > 0) {
          const confirmBody = {
            uploads: successfulUploads.map(({ upload, file, index }) => ({
              mediaId: upload.mediaId,
              fileSizeBytes: file.size,
              sortOrder: media.photos.length + index,
            })),
          };
          const confirmed = isEditMode
            ? await rentListingEditService.confirmMedia(draftId, confirmBody)
            : await rentDraftService.confirmMedia(draftId, confirmBody);

          setUploadingFiles((prev) =>
            prev.filter((f) => !previews.some((p) => p.id === f.id))
          );
          previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
          // Draft confirm may return the full draft payload.
          if (hasFullDraftShape(confirmed)) {
            dispatch(restoreFromDraft(confirmed));
            return;
          }
          // Published edit confirm currently returns media-only payload
          // (items/photos/tours3d at the top level).
          if (hasTopLevelMedia(confirmed)) {
            dispatch(
              setMedia({
                items: confirmed.items ?? [],
                photos: confirmed.photos ?? [],
                tours3d: normalizeTours3d(confirmed.tours3d),
              })
            );
          }
        }
      } catch {
        toast.error("Failed to upload photos.");
      } finally {
        dispatch(endMediaUpload());
        setUploadingFiles((prev) => {
          const remaining = prev.filter((f) =>
            previews.some((p) => p.id === f.id)
          );
          remaining.forEach((f) => URL.revokeObjectURL(f.previewUrl));
          return prev.filter((f) => !previews.some((p) => p.id === f.id));
        });
      }
    },
    [draftId, dispatch, media.photos, t, isEditMode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  });

  async function removePhoto(item: DraftMediaItem) {
    if (!draftId || deletingIds.has(item.id)) return;
    // Backend blocks deleting the last confirmed photo from a live rent listing.
    // Guard client-side so the user gets a clear message instead of a raw API error.
    if (isEditMode && media.photos.length <= 1) {
      toast.error(t("lastPhotoCannotDelete"));
      return;
    }
    setDeletingIds((prev) => new Set(prev).add(item.id));
    try {
      if (isEditMode) {
        await rentListingEditService.deleteMedia(draftId, item.id);
      } else {
        await rentDraftService.deleteMedia(draftId, item.id);
      }
      dispatch(
        setMedia({
          photos: media.photos.filter((p) => p.id !== item.id),
          items: media.items.filter((i) => i.id !== item.id),
        })
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete photo.";
      toast.error(message);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  function handleSaveTour() {
    const name = tourNameInput.trim();
    const url = tourUrlInput.trim();
    const hasAny = name.length > 0 || url.length > 0;
    const bothComplete = name.length > 0 && url.length > 0;

    if (hasAny && !bothComplete) {
      setTourFieldErrors({
        name: !name,
        url: !url,
      });
      toast.error(t("tourBothFieldsRequired"));
      return;
    }

    if (bothComplete && !isValidHttpUrl(url)) {
      setTourFieldErrors({ url: true });
      toast.error(t("tourInvalidUrl"));
      return;
    }

    setTourFieldErrors({});

    if (!bothComplete) {
      dispatch(setMedia({ tours3d: [] }));
      setTourModalOpen(false);
      return;
    }

    dispatch(
      setMedia({
        tours3d: [{ tourName: name, tourUrl: url, sortOrder: 0 }],
      })
    );
    setTourModalOpen(false);
  }

  function removeTour() {
    dispatch(setMedia({ tours3d: [] }));
    setTourNameInput("");
    setTourUrlInput("");
  }

  const savedTour = media.tours3d[0];
  const canSaveTour =
    (tourNameInput.trim() && tourUrlInput.trim()) ||
    (!tourNameInput.trim() && !tourUrlInput.trim());

  return (
    <div className="flex flex-1 flex-col">
      <div className="max-w-lg space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("addPhotosHeading")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("addPhotosSubtitle")}
          </p>

          <div
            {...getRootProps()}
            className={`mt-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 transition-colors ${
              isDragActive ? "border-brand bg-brand/10" : ""
            }`}
          >
            <input {...getInputProps()} />
            <CloudUpload className="size-8 text-brand" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("dragOrBrowse")}{" "}
              <span className="font-medium text-brand">{t("browse")}</span>
            </p>
          </div>

          {(media.photos.length > 0 || uploadingFiles.length > 0) && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.photos.map((item) => {
                const isDeleting = deletingIds.has(item.id);
                return (
                  <div key={item.id} className="group relative aspect-square">
                    <div className="size-full overflow-hidden rounded-lg">
                      <img
                        src={item.url}
                        alt={item.fileName}
                        className={`size-full object-cover${isDeleting ? " opacity-40" : ""}`}
                      />
                    </div>
                    {isDeleting ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-200/60">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePhoto(item)}
                        className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                );
              })}
              {uploadingFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="size-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-brand" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("tourHeading")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("tourSubtitle")}
          </p>

          {savedTour ? (
            <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {savedTour.tourName}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {savedTour.tourUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeTour}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  aria-label={t("removeTour")}
                >
                  <X className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setTourModalOpen(true)}
                className="mt-3 text-sm font-medium text-brand hover:underline cursor-pointer"
              >
                {t("editTour")}
              </button>
            </div>
          ) : (
            <div
              onClick={() => setTourModalOpen(true)}
              className="mt-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 transition-colors hover:border-brand hover:bg-brand/10"
            >
              <Image
                src="/icons/video-frame.svg"
                alt=""
                width={32}
                height={32}
              />
              <p className="mt-2 text-sm font-medium text-brand">
                {t("addTour")}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={tourModalOpen} onOpenChange={setTourModalOpen}>
        <DialogContent className="flex max-h-[min(90vh,720px)] w-[calc(100vw-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle className="text-xl font-bold">
              {t("tourModalTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="flex gap-4">
              <div className="hidden shrink-0 sm:block">
                <div className="flex size-14 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <DoorOpen className="size-8 stroke-[1.5]" aria-hidden />
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                  {t("tourModalLeadHeading")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("tourModalLeadSubtitle")}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm font-medium text-foreground">
              {t("tourSupportedSourcesIntro")}
            </p>
            <div className="mt-3 max-h-52 overflow-y-auto rounded-lg border border-border bg-muted/20 px-4 py-3 sm:max-h-60">
              <div className="grid grid-cols-1 gap-x-8 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-4">
                {providerColumns.map((col, ci) => (
                  <ul
                    key={ci}
                    className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground"
                  >
                    {col.map((name) => (
                      <li key={name} className="pl-0.5 marker:text-brand/70">
                        {name}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="nesto-tour-name"
                  className="text-foreground"
                >
                  {t("tourNameLabel")}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="nesto-tour-name"
                  value={tourNameInput}
                  onChange={(e) => {
                    setTourNameInput(e.target.value);
                    if (tourFieldErrors.name) {
                      setTourFieldErrors((prev) => ({ ...prev, name: false }));
                    }
                  }}
                  placeholder={t("tourNamePlaceholder")}
                  className={cn(
                    "rounded-lg border-border h-12!",
                    tourFieldErrors.name && "border-destructive ring-destructive/20"
                  )}
                  aria-invalid={tourFieldErrors.name}
                />
                <p className="text-xs text-muted-foreground">
                  {t("tourNameHelper")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nesto-tour-url" className="text-foreground">
                  {t("tourLinkLabel")}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="nesto-tour-url"
                  value={tourUrlInput}
                  onChange={(e) => {
                    setTourUrlInput(e.target.value);
                    if (tourFieldErrors.url) {
                      setTourFieldErrors((prev) => ({ ...prev, url: false }));
                    }
                  }}
                  placeholder={t("tourLinkPlaceholder")}
                  inputMode="url"
                  autoComplete="url"
                  className={cn(
                    "rounded-lg border-border h-12!",
                    tourFieldErrors.url && "border-destructive ring-destructive/20"
                  )}
                  aria-invalid={tourFieldErrors.url}
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTourModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveTour}
              disabled={!canSaveTour}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              {t("saveTour")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
