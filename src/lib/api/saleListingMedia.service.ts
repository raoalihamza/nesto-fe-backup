import { apiClient } from "@/lib/api/client";

export interface SalePresignMediaFile {
  listingType: "SALE";
  mediaType: "PHOTO" | "VIDEO" | "TOUR_3D";
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  sortOrder: number;
  metadata?: Record<string, string>;
}

export interface SalePresignBody {
  files: SalePresignMediaFile[];
}

export interface SalePresignUploadItem {
  uploadId: string;
  uploadUrl: string;
  objectKey: string;
  bucket: string;
  method: string;
  headers: Record<string, string>;
  expiresInSeconds: number;
  publicUrl: string;
}

export interface SalePresignResponse {
  uploads: SalePresignUploadItem[];
}

export interface SaleConfirmUpload {
  uploadId: string;
  fileSizeBytes: number;
  sortOrder: number;
  metadata?: Record<string, string>;
}

export interface SaleConfirmBody {
  uploads: SaleConfirmUpload[];
}

export interface SaleMediaItem {
  id: string;
  mediaType: string;
  status: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  sortOrder: number;
  objectKey: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleConfirmMediaResponse {
  items: SaleMediaItem[];
  photos: SaleMediaItem[];
  tours3d: unknown[];
}

export const saleListingMediaService = {
  presignMedia(body: SalePresignBody): Promise<SalePresignResponse> {
    return apiClient<SalePresignResponse>("/listings/sale/media/presign", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  confirmMedia(body: SaleConfirmBody): Promise<SaleConfirmMediaResponse> {
    return apiClient<SaleConfirmMediaResponse>("/listings/sale/media/confirm", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  deleteMedia(uploadId: string): Promise<{ deleted: boolean }> {
    return apiClient<{ deleted: boolean }>(
      `/listings/sale/media/${uploadId}`,
      {
        method: "DELETE",
      }
    );
  },
};
