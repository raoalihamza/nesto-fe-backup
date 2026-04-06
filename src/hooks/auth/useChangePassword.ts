"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth.service";
import type { ApiError } from "@/types/user";

export function useChangePassword(): UseMutationResult<
  void,
  ApiError,
  {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
  }
> {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword, revokeOtherSessions }) =>
      authService.changePassword(
        currentPassword,
        newPassword,
        revokeOtherSessions
      ),
  });
}
