"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth.service";
import type { ApiError } from "@/types/user";

export function useResetPassword(): UseMutationResult<
  void,
  ApiError,
  { token: string; newPassword: string }
> {
  return useMutation({
    mutationFn: ({ token, newPassword }) =>
      authService.resetPassword(token, newPassword),
  });
}
