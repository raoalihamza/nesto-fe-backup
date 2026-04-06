import { apiClient } from "@/lib/api/client";
import type { AuthSuccessResponse, BackendUser } from "@/types/user";

const DEVICE = {
  deviceId: "web-local",
  deviceName: "Chrome",
  platform: "web",
} as const;

export const authService = {
  login(email: string, password: string): Promise<AuthSuccessResponse> {
    return apiClient<AuthSuccessResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, device: DEVICE }),
      skipAuth: true,
    });
  },

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthSuccessResponse> {
    return apiClient<AuthSuccessResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        device: DEVICE,
      }),
      skipAuth: true,
    });
  },

  logout(refreshToken: string): Promise<void> {
    return apiClient<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  logoutAll(): Promise<void> {
    return apiClient<void>("/auth/logout-all", {
      method: "POST",
    });
  },

  refresh(refreshToken: string): Promise<AuthSuccessResponse> {
    return apiClient<AuthSuccessResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    });
  },

  forgotPassword(email: string): Promise<void> {
    return apiClient<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
      skipAuth: true,
    });
  },

  verifyEmail(token: string): Promise<void> {
    return apiClient<void>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    });
  },

  resendVerification(email: string): Promise<void> {
    return apiClient<void>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  me(): Promise<{ user: BackendUser }> {
    return apiClient<{ user: BackendUser }>("/auth/me", {
      method: "GET",
    });
  },

  updateMe(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<{ user: BackendUser }> {
    return apiClient<{ user: BackendUser }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  changePassword(
    currentPassword: string,
    newPassword: string,
    revokeOtherSessions = true
  ): Promise<void> {
    return apiClient<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
    });
  },

  googleLogin(idToken: string): Promise<AuthSuccessResponse> {
    return apiClient<AuthSuccessResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, device: DEVICE }),
      skipAuth: true,
    });
  },

  facebookLogin(accessToken: string): Promise<AuthSuccessResponse> {
    return apiClient<AuthSuccessResponse>("/auth/facebook", {
      method: "POST",
      body: JSON.stringify({ accessToken, device: DEVICE }),
      skipAuth: true,
    });
  },
};
