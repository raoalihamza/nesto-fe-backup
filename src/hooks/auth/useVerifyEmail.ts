"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth.service";
import type { ApiError } from "@/types/user";

export function useVerifyEmail(): UseMutationResult<
  void,
  ApiError,
  { token: string }
> {
  return useMutation({
    mutationFn: ({ token }) => authService.verifyEmail(token),
  });
}
