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

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
  timestamp: string;
  path: string;
}
