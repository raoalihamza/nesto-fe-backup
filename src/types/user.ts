export type UserRole = "buyer" | "seller" | "renter" | "owner" | "agent" | "admin";

export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  primaryRole: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  authProviderPrimary: "local" | "google" | "facebook" | "apple";
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface AuthSession {
  id: string;
  provider: string;
  expiresAt: string;
}

export interface AuthSuccessResponse {
  user: BackendUser;
  session: AuthSession;
  tokens: AuthTokens;
}

/** Optional validation payload on `REQUEST_VALIDATION_FAILED` and similar. */
export interface ApiValidationIssue {
  code?: string;
  path?: unknown;
  field?: string;
  message?: string;
}

export interface ApiErrorDetails {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
  issues?: ApiValidationIssue[];
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
  timestamp: string;
  path: string;
  details?: ApiErrorDetails;
}
