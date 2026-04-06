export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadResponse {
  url: string;
  key: string;
  size: number;
  type: string;
}

export interface DraftResponse {
  draftId: string;
  savedAt: string;
}
